-- Add weight goals and body metrics tracking
-- Extends the weight tracker with goal setting and body composition features

-- Create weight_goal table
create table if not exists weight_goal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  target_weight numeric not null check (target_weight > 0 and target_weight < 1000),
  unit text not null default 'kg' check (unit in ('kg', 'lb')),
  goal_type text not null check (goal_type in ('lose', 'maintain', 'gain')),
  start_weight numeric,
  start_date date default current_date,
  target_date date,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create body_metrics table
create table if not exists body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  height_cm numeric check (height_cm > 0 and height_cm < 300),
  waist_cm numeric check (waist_cm > 0 and waist_cm < 500),
  neck_cm numeric check (neck_cm > 0 and neck_cm < 200),
  hip_cm numeric check (hip_cm > 0 and hip_cm < 500),
  bodyfat_est numeric check (bodyfat_est >= 0 and bodyfat_est <= 100),
  gender text check (gender in ('male', 'female')),
  logged_at date not null default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- One entry per user per date
  unique(user_id, logged_at)
);

-- Create indexes
create index if not exists weight_goal_user_id_idx on weight_goal(user_id);
create index if not exists body_metrics_user_id_logged_at_idx on body_metrics(user_id, logged_at desc);

-- Enable RLS
alter table weight_goal enable row level security;
alter table body_metrics enable row level security;

-- RLS Policies for weight_goal
create policy "Users can view own weight goal"
  on weight_goal for select
  using (auth.uid() = user_id);

create policy "Users can insert own weight goal"
  on weight_goal for insert
  with check (auth.uid() = user_id);

create policy "Users can update own weight goal"
  on weight_goal for update
  using (auth.uid() = user_id);

create policy "Users can delete own weight goal"
  on weight_goal for delete
  using (auth.uid() = user_id);

-- RLS Policies for body_metrics
create policy "Users can view own body metrics"
  on body_metrics for select
  using (auth.uid() = user_id);

create policy "Users can insert own body metrics"
  on body_metrics for insert
  with check (auth.uid() = user_id);

create policy "Users can update own body metrics"
  on body_metrics for update
  using (auth.uid() = user_id);

create policy "Users can delete own body metrics"
  on body_metrics for delete
  using (auth.uid() = user_id);

-- Update triggers
create or replace function update_weight_goal_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function update_body_metrics_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger weight_goal_updated_at
  before update on weight_goal
  for each row
  execute function update_weight_goal_updated_at();

create trigger body_metrics_updated_at
  before update on body_metrics
  for each row
  execute function update_body_metrics_updated_at();

-- Comments
comment on table weight_goal is 'User weight goals and targets';
comment on table body_metrics is 'User body composition measurements';


