-- Social features: Friends, Leaderboards, Gyms, Anti-cheat
-- This migration adds tables for friend relationships, gym memberships, leaderboards, and anti-cheat measures

-- ============================================================================
-- GYMS
-- ============================================================================

create table if not exists gym (
  code text primary key,
  name text not null,
  description text,
  owner_id uuid references auth.users(id) on delete set null,
  is_verified boolean default false,
  require_approval boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_gym_owner on gym(owner_id);

-- ============================================================================
-- GYM MEMBERSHIP
-- ============================================================================

create table if not exists gym_member (
  gym_code text references gym(code) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  joined_at timestamptz default now(),
  opt_in boolean default true,
  is_approved boolean default true, -- false if gym requires approval
  primary key (gym_code, user_id)
);

create index if not exists idx_gym_member_user on gym_member(user_id);
create index if not exists idx_gym_member_opt_in on gym_member(gym_code, opt_in);

-- ============================================================================
-- FRIEND REQUESTS
-- ============================================================================

create table if not exists friend_request (
  id uuid primary key default gen_random_uuid(),
  from_user uuid references auth.users(id) on delete cascade not null,
  to_user uuid references auth.users(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(from_user, to_user)
);

create index if not exists idx_friend_request_to_user on friend_request(to_user) where status = 'pending';
create index if not exists idx_friend_request_from_user on friend_request(from_user);

-- ============================================================================
-- FRIENDS
-- ============================================================================

create table if not exists friend (
  user_id uuid references auth.users(id) on delete cascade,
  friend_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, friend_id),
  check (user_id != friend_id)
);

create index if not exists idx_friend_user on friend(user_id);
create index if not exists idx_friend_friend on friend(friend_id);

-- ============================================================================
-- WEEKLY XP SNAPSHOTS (for fast leaderboards)
-- ============================================================================

create table if not exists weekly_xp (
  user_id uuid references auth.users(id) on delete cascade,
  iso_week int not null, -- e.g., 202545 (year + week number)
  xp int not null default 0,
  workouts int not null default 0,
  volume_kg numeric default 0,
  pr_count int not null default 0,
  gym_code text references gym(code) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (user_id, iso_week)
);

create index if not exists idx_weekly_xp_week on weekly_xp(iso_week, xp desc);
create index if not exists idx_weekly_xp_gym on weekly_xp(gym_code, iso_week, xp desc) where gym_code is not null;

-- ============================================================================
-- PRIVACY SETTINGS (extend profile)
-- ============================================================================

alter table profile
  add column if not exists friend_request_privacy text default 'anyone' check (friend_request_privacy in ('anyone', 'friends_of_friends', 'nobody')),
  add column if not exists show_on_global_leaderboard boolean default false,
  add column if not exists show_on_gym_leaderboard boolean default true,
  add column if not exists friends_list_public boolean default false;

-- ============================================================================
-- ANTI-CHEAT FLAGS
-- ============================================================================

create table if not exists anti_cheat_flag (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  flag_type text not null, -- 'xp_spike', 'volume_spike', 'impossible_set', 'scripted_behavior', 'new_account'
  severity text default 'low' check (severity in ('low', 'medium', 'high')),
  status text default 'pending' check (status in ('pending', 'cleared', 'confirmed')),
  details jsonb,
  flagged_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  notes text
);

create index if not exists idx_anti_cheat_user on anti_cheat_flag(user_id);
create index if not exists idx_anti_cheat_status on anti_cheat_flag(status, severity);

-- Account age tracking for new user throttling
alter table profile
  add column if not exists account_verified_at timestamptz;

-- Mark existing accounts as verified
update profile set account_verified_at = created_at where account_verified_at is null;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Gym table
alter table gym enable row level security;

create policy "Gyms are viewable by everyone"
  on gym for select
  using (true);

create policy "Users can create gyms"
  on gym for insert
  with check (auth.uid() = owner_id);

create policy "Gym owners can update their gyms"
  on gym for update
  using (auth.uid() = owner_id);

create policy "Gym owners can delete their gyms"
  on gym for delete
  using (auth.uid() = owner_id);

-- Gym members
alter table gym_member enable row level security;

create policy "Users can view gym members"
  on gym_member for select
  using (true);

create policy "Users can join gyms"
  on gym_member for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own membership"
  on gym_member for update
  using (auth.uid() = user_id);

create policy "Users can leave gyms"
  on gym_member for delete
  using (auth.uid() = user_id);

-- Friend requests
alter table friend_request enable row level security;

create policy "Users can view their own friend requests"
  on friend_request for select
  using (auth.uid() = from_user or auth.uid() = to_user);

create policy "Users can send friend requests"
  on friend_request for insert
  with check (auth.uid() = from_user);

create policy "Users can update received requests"
  on friend_request for update
  using (auth.uid() = to_user);

create policy "Users can delete their sent requests"
  on friend_request for delete
  using (auth.uid() = from_user);

-- Friends
alter table friend enable row level security;

create policy "Users can view friendships"
  on friend for select
  using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "System can create friendships"
  on friend for insert
  with check (auth.uid() = user_id or auth.uid() = friend_id);

create policy "Users can delete their friendships"
  on friend for delete
  using (auth.uid() = user_id);

-- Weekly XP
alter table weekly_xp enable row level security;

create policy "Users can view weekly xp"
  on weekly_xp for select
  using (true); -- Public for leaderboards

create policy "System can insert weekly xp"
  on weekly_xp for insert
  with check (true); -- Will be managed by background job

create policy "System can update weekly xp"
  on weekly_xp for update
  using (true);

-- Anti-cheat flags
alter table anti_cheat_flag enable row level security;

create policy "Users can view their own flags"
  on anti_cheat_flag for select
  using (auth.uid() = user_id);

create policy "System can create flags"
  on anti_cheat_flag for insert
  with check (true);

-- Admins can view/update all flags (will be restricted by admin_user check in API)
create policy "Admins can update flags"
  on anti_cheat_flag for update
  using (
    exists (
      select 1 from admin_user
      where admin_user.user_id = auth.uid()
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get current ISO week (YYYYWW format)
create or replace function get_iso_week(date_val timestamptz default now())
returns int
language sql
immutable
as $$
  select (extract(year from date_val)::int * 100) + extract(week from date_val)::int;
$$;

-- Function to accept friend request (creates bidirectional friendship)
create or replace function accept_friend_request(request_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_from_user uuid;
  v_to_user uuid;
begin
  -- Get request details
  select from_user, to_user into v_from_user, v_to_user
  from friend_request
  where id = request_id and to_user = auth.uid() and status = 'pending';

  if not found then
    raise exception 'Friend request not found or already processed';
  end if;

  -- Update request status
  update friend_request
  set status = 'accepted', updated_at = now()
  where id = request_id;

  -- Create bidirectional friendship
  insert into friend (user_id, friend_id)
  values (v_from_user, v_to_user), (v_to_user, v_from_user)
  on conflict do nothing;
end;
$$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

comment on table gym is 'Gyms that users can join for location-based leaderboards';
comment on table gym_member is 'User gym memberships with opt-in preferences';
comment on table friend_request is 'Friend requests between users';
comment on table friend is 'Bidirectional friend relationships';
comment on table weekly_xp is 'Pre-aggregated weekly XP snapshots for fast leaderboards';
comment on table anti_cheat_flag is 'Flags for suspicious activity requiring review';

comment on column weekly_xp.iso_week is 'ISO week in YYYYWW format (e.g., 202545)';
comment on column gym.is_verified is 'Official/verified gym status';
comment on column gym.require_approval is 'Whether new members need owner approval';
comment on column profile.account_verified_at is 'When account passed new user throttle period';

