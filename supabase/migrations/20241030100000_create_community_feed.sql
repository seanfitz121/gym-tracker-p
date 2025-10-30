-- Community Feed Feature Migration
-- Creates tables for posts, comments, reactions, views, and moderation

-- =====================================================
-- 1. COMMUNITY CATEGORIES
-- =====================================================

create table if not exists public.community_category (
  code text primary key,
  name text not null,
  description text,
  icon text, -- emoji or icon name
  display_order int default 0,
  created_at timestamptz default now()
);

-- Insert default categories
insert into public.community_category (code, name, description, icon, display_order) values
  ('general', 'General', 'General gym talk and discussions', '💬', 1),
  ('progress', 'Progress & Wins', 'Share your transformation and PRs', '🏆', 2),
  ('nutrition', 'Nutrition & Diet', 'Nutrition tips, meal prep, and diet advice', '🥗', 3),
  ('programs', 'Training Programs', 'Workout programs, splits, and routines', '📋', 4),
  ('form-check', 'Form Checks', 'Get feedback on your lifting form', '🎥', 5),
  ('motivation', 'Motivation', 'Inspirational content and success stories', '💪', 6);

-- =====================================================
-- 2. POSTS
-- =====================================================

create table if not exists public.post (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  category text not null references public.community_category(code),
  title text,
  body text not null,
  media jsonb default '[]'::jsonb, -- [{url, type, alt}]
  visibility text default 'public' check (visibility in ('public', 'friends')),
  is_pinned boolean default false,
  is_locked boolean default false, -- prevents new comments
  is_hidden boolean default false, -- soft delete by admin
  view_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint post_user_id_fkey foreign key (user_id) references public.profile(id) on delete cascade
);

-- Indexes for performance
create index idx_post_user_id on public.post(user_id);
create index idx_post_category on public.post(category);
create index idx_post_created_at on public.post(created_at desc);
create index idx_post_visibility on public.post(visibility);
create index idx_post_hidden on public.post(is_hidden) where is_hidden = false;

-- =====================================================
-- 3. COMMENTS
-- =====================================================

create table if not exists public.comment (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.post(id) on delete cascade,
  user_id uuid not null,
  parent_comment_id uuid references public.comment(id) on delete cascade, -- for replies
  body text not null,
  is_hidden boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint comment_user_id_fkey foreign key (user_id) references public.profile(id) on delete cascade
);

-- Indexes
create index idx_comment_post_id on public.comment(post_id);
create index idx_comment_user_id on public.comment(user_id);
create index idx_comment_parent on public.comment(parent_comment_id);
create index idx_comment_created_at on public.comment(created_at);

-- =====================================================
-- 4. REACTIONS (Likes)
-- =====================================================

create table if not exists public.reaction (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('post', 'comment')),
  target_id uuid not null,
  user_id uuid not null,
  kind text not null default 'like' check (kind in ('like')),
  created_at timestamptz default now(),
  unique(target_type, target_id, user_id, kind),
  constraint reaction_user_id_fkey foreign key (user_id) references public.profile(id) on delete cascade
);

-- Indexes
create index idx_reaction_target on public.reaction(target_type, target_id);
create index idx_reaction_user_id on public.reaction(user_id);

-- =====================================================
-- 5. POST VIEWS
-- =====================================================

create table if not exists public.post_view (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.post(id) on delete cascade,
  user_id uuid, -- nullable for anonymous
  ip_address inet, -- for rate limiting anonymous views
  viewed_at timestamptz default now(),
  constraint post_view_user_id_fkey foreign key (user_id) references public.profile(id) on delete cascade
);

-- Indexes
create index idx_post_view_post_id on public.post_view(post_id);
create index idx_post_view_user_id on public.post_view(user_id) where user_id is not null;
create index idx_post_view_viewed_at on public.post_view(viewed_at);

-- =====================================================
-- 6. REPORTS (Moderation)
-- =====================================================

create table if not exists public.community_report (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null,
  target_type text not null check (target_type in ('post', 'comment')),
  target_id uuid not null,
  reason text not null,
  details text,
  status text default 'open' check (status in ('open', 'reviewed', 'dismissed', 'actioned')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  constraint community_report_reporter_id_fkey foreign key (reporter_id) references public.profile(id) on delete cascade,
  constraint community_report_reviewed_by_fkey foreign key (reviewed_by) references public.profile(id) on delete set null
);

-- Indexes
create index idx_report_status on public.community_report(status);
create index idx_report_target on public.community_report(target_type, target_id);
create index idx_report_created_at on public.community_report(created_at desc);

-- =====================================================
-- 7. USER POST LIMITS (Anti-spam)
-- =====================================================

create table if not exists public.user_post_limit (
  user_id uuid primary key,
  posts_today int default 0,
  last_post_at timestamptz,
  last_comment_at timestamptz,
  is_limited boolean default false, -- manual spam flag
  updated_at timestamptz default now(),
  constraint user_post_limit_user_id_fkey foreign key (user_id) references public.profile(id) on delete cascade
);

-- =====================================================
-- 8. MATERIALIZED VIEW COUNTS (Performance)
-- =====================================================

-- This can be a materialized view or computed fields
-- For now, we'll use triggers to maintain counts

-- Function to update post view count
create or replace function update_post_view_count()
returns trigger as $$
begin
  update public.post
  set view_count = (
    select count(*) from public.post_view where post_id = new.post_id
  )
  where id = new.post_id;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for view count
create trigger trigger_update_post_view_count
  after insert on public.post_view
  for each row
  execute function update_post_view_count();

-- Function to reset daily post limits
create or replace function reset_daily_post_limits()
returns void as $$
begin
  update public.user_post_limit
  set posts_today = 0
  where date_trunc('day', last_post_at) < date_trunc('day', now());
end;
$$ language plpgsql security definer;

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
alter table public.community_category enable row level security;
alter table public.post enable row level security;
alter table public.comment enable row level security;
alter table public.reaction enable row level security;
alter table public.post_view enable row level security;
alter table public.community_report enable row level security;
alter table public.user_post_limit enable row level security;

-- Categories: Public read
create policy "Categories are viewable by everyone"
  on public.community_category for select
  using (true);

-- Posts: Read policy (respects visibility and hidden status)
create policy "Posts are viewable based on visibility"
  on public.post for select
  using (
    is_hidden = false and (
      visibility = 'public'
      or (visibility = 'friends' and (
        user_id = auth.uid()
        or exists (
          select 1 from public.friend
          where (user_id = auth.uid() and friend_id = post.user_id)
          or (friend_id = auth.uid() and user_id = post.user_id)
        )
      ))
    )
  );

-- Posts: Insert policy (authenticated users)
create policy "Users can create posts"
  on public.post for insert
  with check (auth.uid() = user_id);

-- Posts: Update policy (own posts only)
create policy "Users can update own posts"
  on public.post for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Posts: Delete policy (own posts or admin)
create policy "Users can delete own posts"
  on public.post for delete
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.admin_user where user_id = auth.uid()
    )
  );

-- Comments: Read policy (visible if post is visible and not hidden)
create policy "Comments are viewable if post is visible"
  on public.comment for select
  using (
    is_hidden = false and
    exists (
      select 1 from public.post
      where id = comment.post_id
      and is_hidden = false
    )
  );

-- Comments: Insert policy (authenticated users)
create policy "Users can create comments"
  on public.comment for insert
  with check (auth.uid() = user_id);

-- Comments: Update policy (own comments only)
create policy "Users can update own comments"
  on public.comment for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Comments: Delete policy (own comments or admin)
create policy "Users can delete own comments"
  on public.comment for delete
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.admin_user where user_id = auth.uid()
    )
  );

-- Reactions: Read policy (public)
create policy "Reactions are viewable by everyone"
  on public.reaction for select
  using (true);

-- Reactions: Insert policy (authenticated users)
create policy "Users can create reactions"
  on public.reaction for insert
  with check (auth.uid() = user_id);

-- Reactions: Delete policy (own reactions only)
create policy "Users can delete own reactions"
  on public.reaction for delete
  using (auth.uid() = user_id);

-- Post Views: Insert policy (anyone can record views)
create policy "Anyone can record post views"
  on public.post_view for insert
  with check (true);

-- Post Views: Select policy (public for counts)
create policy "Post views are countable by everyone"
  on public.post_view for select
  using (true);

-- Reports: Insert policy (authenticated users)
create policy "Users can create reports"
  on public.community_report for insert
  with check (auth.uid() = reporter_id);

-- Reports: Read policy (admins only)
create policy "Admins can view reports"
  on public.community_report for select
  using (
    exists (
      select 1 from public.admin_user where user_id = auth.uid()
    )
  );

-- Reports: Update policy (admins only)
create policy "Admins can update reports"
  on public.community_report for update
  using (
    exists (
      select 1 from public.admin_user where user_id = auth.uid()
    )
  );

-- User post limits: Read/write by owner or system
create policy "Users can view own post limits"
  on public.user_post_limit for select
  using (auth.uid() = user_id);

create policy "Users can update own post limits"
  on public.user_post_limit for insert
  with check (auth.uid() = user_id);

create policy "Users can modify own post limits"
  on public.user_post_limit for update
  using (auth.uid() = user_id);

-- =====================================================
-- 10. HELPER FUNCTIONS
-- =====================================================

-- Function to check if user can post (rate limiting)
create or replace function can_user_post(p_user_id uuid)
returns boolean as $$
declare
  v_posts_today int;
  v_last_post timestamptz;
  v_is_limited boolean;
begin
  select posts_today, last_post_at, is_limited
  into v_posts_today, v_last_post, v_is_limited
  from public.user_post_limit
  where user_id = p_user_id;

  -- Manual spam flag
  if v_is_limited then
    return false;
  end if;

  -- Check daily limit (10 posts per day)
  if v_posts_today >= 10 and date_trunc('day', v_last_post) = date_trunc('day', now()) then
    return false;
  end if;

  return true;
end;
$$ language plpgsql security definer;

-- Function to increment post count
create or replace function increment_user_post_count(p_user_id uuid)
returns void as $$
begin
  insert into public.user_post_limit (user_id, posts_today, last_post_at)
  values (p_user_id, 1, now())
  on conflict (user_id) do update
  set 
    posts_today = case
      when date_trunc('day', user_post_limit.last_post_at) = date_trunc('day', now())
      then user_post_limit.posts_today + 1
      else 1
    end,
    last_post_at = now(),
    updated_at = now();
end;
$$ language plpgsql security definer;

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant select on public.community_category to anon, authenticated;
grant all on public.post to authenticated;
grant all on public.comment to authenticated;
grant all on public.reaction to authenticated;
grant all on public.post_view to anon, authenticated;
grant all on public.community_report to authenticated;
grant all on public.user_post_limit to authenticated;

-- =====================================================
-- DONE
-- =====================================================

