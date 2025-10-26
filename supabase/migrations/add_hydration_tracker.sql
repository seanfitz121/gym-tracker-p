-- Hydration Tracker Migration
-- Tracks daily water intake for premium users

-- Create hydration_log table
create table if not exists hydration_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  amount_ml integer not null check (amount_ml > 0 and amount_ml <= 10000),
  logged_at timestamptz not null default now(),
  created_at timestamptz default now()
);

-- Create indexes for faster queries
create index if not exists hydration_log_user_id_logged_at_idx on hydration_log(user_id, logged_at desc);

-- Enable RLS
alter table hydration_log enable row level security;

-- RLS Policies
-- Users can view their own hydration logs
create policy "Users can view own hydration logs"
  on hydration_log for select
  using (auth.uid() = user_id);

-- Users can insert their own hydration logs
create policy "Users can insert own hydration logs"
  on hydration_log for insert
  with check (auth.uid() = user_id);

-- Users can update their own hydration logs
create policy "Users can update own hydration logs"
  on hydration_log for update
  using (auth.uid() = user_id);

-- Users can delete their own hydration logs
create policy "Users can delete own hydration logs"
  on hydration_log for delete
  using (auth.uid() = user_id);

-- Function to get daily total for a user
create or replace function get_daily_hydration_total(
  p_user_id uuid,
  p_date date default current_date
)
returns integer as $$
  select coalesce(sum(amount_ml), 0)::integer
  from hydration_log
  where user_id = p_user_id
    and date(logged_at) = p_date;
$$ language sql stable;

-- Function to calculate hydration streak
create or replace function calculate_hydration_streak(
  p_user_id uuid,
  p_goal_ml integer default 3000
)
returns integer as $$
declare
  v_streak integer := 0;
  v_date date := current_date;
  v_total integer;
begin
  -- Check each day going backwards
  loop
    select coalesce(sum(amount_ml), 0)
    into v_total
    from hydration_log
    where user_id = p_user_id
      and date(logged_at) = v_date;
    
    -- If goal not met, break
    exit when v_total < p_goal_ml;
    
    v_streak := v_streak + 1;
    v_date := v_date - interval '1 day';
    
    -- Safety limit: don't go back more than 365 days
    exit when v_streak >= 365;
  end loop;
  
  return v_streak;
end;
$$ language plpgsql stable;

-- Comments
comment on table hydration_log is 'Daily water intake tracking for users';
comment on function get_daily_hydration_total is 'Calculate total water intake for a specific day';
comment on function calculate_hydration_streak is 'Calculate consecutive days meeting hydration goal';

