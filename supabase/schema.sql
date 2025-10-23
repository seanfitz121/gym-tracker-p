-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profile table
create table public.profile (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create enum for weight units
create type unit_weight as enum ('kg','lb');

-- Create exercise table
create table public.exercise (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  body_part text,
  is_custom boolean default true,
  created_at timestamptz default now()
);

-- Create workout_session table
create table public.workout_session (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  title text,
  notes text,
  created_at timestamptz default now()
);

-- Create set_entry table
create table public.set_entry (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_session(id) on delete cascade,
  exercise_id uuid not null references public.exercise(id) on delete cascade,
  set_order int not null,
  reps int not null,
  weight numeric(6,2) not null,
  weight_unit unit_weight not null default 'kg',
  rpe numeric(3,1),
  is_warmup boolean default false,
  created_at timestamptz default now()
);

-- Create personal_record table
create table public.personal_record (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercise(id) on delete cascade,
  reps int not null,
  weight numeric(6,2) not null,
  weight_unit unit_weight not null default 'kg',
  estimated_1rm numeric(6,2),
  achieved_at timestamptz not null default now()
);

-- Create template table
create table public.template (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  payload jsonb not null,
  created_at timestamptz default now()
);

-- Create gamification table
create table public.user_gamification (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  total_xp int not null default 0,
  level int not null default 1,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_workout_date timestamptz,
  forgiveness_used_at timestamptz,
  badges text[] default '{}',
  weekly_goal jsonb,
  daily_xp_earned int not null default 0,
  rank_code text,
  pro_rank_code text,
  rank_scale_code text default 'free',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create rank scales table
create table public.rank_scale (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  created_at timestamptz default now()
);

-- Create rank definitions table
create table public.rank_definition (
  id uuid primary key default gen_random_uuid(),
  scale_code text not null references public.rank_scale(code) on delete cascade,
  code text not null,
  name text not null,
  min_xp int not null,
  color text,
  icon text,
  sort_order int not null,
  created_at timestamptz default now(),
  unique(scale_code, code)
);

-- Create admin users table
create table public.admin_user (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- Create announcements table
create table public.announcement (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  created_at timestamptz default now()
);

-- Create indexes for better query performance
create index idx_exercise_user_id on public.exercise(user_id);
create index idx_workout_session_user_id on public.workout_session(user_id);
create index idx_workout_session_started_at on public.workout_session(started_at desc);
create index idx_set_entry_session_id on public.set_entry(session_id);
create index idx_set_entry_exercise_id on public.set_entry(exercise_id);
create index idx_personal_record_user_id on public.personal_record(user_id);
create index idx_personal_record_exercise_id on public.personal_record(exercise_id);
create index idx_template_user_id on public.template(user_id);
create index idx_user_gamification_user_id on public.user_gamification(user_id);

-- Enable Row Level Security
alter table public.profile enable row level security;
alter table public.exercise enable row level security;
alter table public.workout_session enable row level security;
alter table public.set_entry enable row level security;
alter table public.personal_record enable row level security;
alter table public.template enable row level security;
alter table public.user_gamification enable row level security;
alter table public.rank_scale enable row level security;
alter table public.rank_definition enable row level security;
alter table public.admin_user enable row level security;
alter table public.announcement enable row level security;

-- Profile policies
create policy "Users can view their own profile"
  on public.profile for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profile for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profile for insert
  with check (auth.uid() = id);

-- Exercise policies
create policy "Users can view their own exercises"
  on public.exercise for select
  using (auth.uid() = user_id);

create policy "Users can create their own exercises"
  on public.exercise for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own exercises"
  on public.exercise for update
  using (auth.uid() = user_id);

create policy "Users can delete their own exercises"
  on public.exercise for delete
  using (auth.uid() = user_id);

-- Workout session policies
create policy "Users can view their own workout sessions"
  on public.workout_session for select
  using (auth.uid() = user_id);

create policy "Users can create their own workout sessions"
  on public.workout_session for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own workout sessions"
  on public.workout_session for update
  using (auth.uid() = user_id);

create policy "Users can delete their own workout sessions"
  on public.workout_session for delete
  using (auth.uid() = user_id);

-- Set entry policies
create policy "Users can view set entries for their sessions"
  on public.set_entry for select
  using (
    exists (
      select 1 from public.workout_session
      where workout_session.id = set_entry.session_id
      and workout_session.user_id = auth.uid()
    )
  );

create policy "Users can create set entries for their sessions"
  on public.set_entry for insert
  with check (
    exists (
      select 1 from public.workout_session
      where workout_session.id = set_entry.session_id
      and workout_session.user_id = auth.uid()
    )
  );

create policy "Users can update set entries for their sessions"
  on public.set_entry for update
  using (
    exists (
      select 1 from public.workout_session
      where workout_session.id = set_entry.session_id
      and workout_session.user_id = auth.uid()
    )
  );

create policy "Users can delete set entries for their sessions"
  on public.set_entry for delete
  using (
    exists (
      select 1 from public.workout_session
      where workout_session.id = set_entry.session_id
      and workout_session.user_id = auth.uid()
    )
  );

-- Personal record policies
create policy "Users can view their own PRs"
  on public.personal_record for select
  using (auth.uid() = user_id);

create policy "Users can create their own PRs"
  on public.personal_record for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own PRs"
  on public.personal_record for update
  using (auth.uid() = user_id);

create policy "Users can delete their own PRs"
  on public.personal_record for delete
  using (auth.uid() = user_id);

-- Template policies
create policy "Users can view their own templates"
  on public.template for select
  using (auth.uid() = user_id);

create policy "Users can create their own templates"
  on public.template for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own templates"
  on public.template for update
  using (auth.uid() = user_id);

create policy "Users can delete their own templates"
  on public.template for delete
  using (auth.uid() = user_id);

-- Gamification policies
create policy "Users can view their own gamification data"
  on public.user_gamification for select
  using (auth.uid() = user_id);

create policy "Users can create their own gamification data"
  on public.user_gamification for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own gamification data"
  on public.user_gamification for update
  using (auth.uid() = user_id);

-- Rank scale policies
create policy "Rank scales are readable by authenticated users"
  on public.rank_scale for select
  to authenticated
  using (true);

-- Rank definition policies
create policy "Rank definitions are readable by authenticated users"
  on public.rank_definition for select
  to authenticated
  using (true);

-- Admin user policies
create policy "Users can read their own admin status"
  on public.admin_user for select
  to authenticated
  using (user_id = auth.uid());

-- Announcement policies
create policy "All authenticated users can view announcements"
  on public.announcement for select
  to authenticated
  using (true);

create policy "Only admins can insert announcements"
  on public.announcement for insert
  to authenticated
  with check (
    exists (
      select 1 from public.admin_user
      where admin_user.user_id = auth.uid()
    )
  );

create policy "Only admins can delete announcements"
  on public.announcement for delete
  to authenticated
  using (
    exists (
      select 1 from public.admin_user
      where admin_user.user_id = auth.uid()
    )
  );

-- Function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profile (id, display_name)
  values (new.id, new.email);
  
  insert into public.user_gamification (user_id, rank_code, rank_scale_code)
  values (new.id, 'NOOB', 'free');
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update gamification updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_user_gamification_updated_at
  before update on public.user_gamification
  for each row execute procedure public.update_updated_at_column();

-- Create trigger for profile updated_at
create trigger update_profile_updated_at
  before update on public.profile
  for each row execute procedure public.update_updated_at_column();

-- Seed rank scales
insert into public.rank_scale (code, name) values ('free', 'Free')
on conflict (code) do nothing;

insert into public.rank_scale (code, name) values ('pro', 'Pro')
on conflict (code) do nothing;

-- Seed free rank definitions
insert into public.rank_definition (scale_code, code, name, min_xp, color, icon, sort_order) values
('free', 'NOOB', 'Noob', 0, 'slate', 'dumbbell', 1),
('free', 'ROOKIE', 'Rookie', 100, 'sky', 'sparkles', 2),
('free', 'NOVICE', 'Novice', 300, 'indigo', 'star', 3),
('free', 'APPRENTICE', 'Apprentice', 600, 'violet', 'zap', 4),
('free', 'INTERMEDIATE', 'Intermediate', 1000, 'purple', 'award', 5),
('free', 'GYM_RAT', 'Gym Rat', 1600, 'amber', 'flame', 6),
('free', 'ATHLETE', 'Athlete', 2300, 'emerald', 'trophy', 7),
('free', 'POWERLIFTER', 'Powerlifter', 3200, 'cyan', 'dribbble', 8),
('free', 'BEAST', 'Beast', 4300, 'rose', 'skull', 9),
('free', 'BODYBUILDER', 'Bodybuilder', 5600, 'yellow', 'crown', 10)
on conflict (scale_code, code) do nothing;

-- Create indexes for efficient rank lookups
create index if not exists idx_rank_definition_scale_xp 
on public.rank_definition(scale_code, min_xp desc);

create index if not exists idx_user_gamification_rank 
on public.user_gamification(rank_code, rank_scale_code);

-- Create index for efficient announcement queries
create index if not exists idx_announcement_created_at 
on public.announcement(created_at desc);

