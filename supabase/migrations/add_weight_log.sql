-- Create weight_log table for tracking bodyweight over time
create table if not exists weight_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  weight numeric not null check (weight > 0 and weight < 1000),
  unit text not null default 'kg' check (unit in ('kg', 'lb')),
  logged_at date not null default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Prevent duplicate entries for same user on same date
  unique(user_id, logged_at)
);

-- Create index for faster queries
create index if not exists weight_log_user_id_logged_at_idx on weight_log(user_id, logged_at desc);

-- Enable RLS
alter table weight_log enable row level security;

-- RLS Policies
-- Users can view their own weight logs
create policy "Users can view own weight logs"
  on weight_log for select
  using (auth.uid() = user_id);

-- Users can insert their own weight logs
create policy "Users can insert own weight logs"
  on weight_log for insert
  with check (auth.uid() = user_id);

-- Users can update their own weight logs
create policy "Users can update own weight logs"
  on weight_log for update
  using (auth.uid() = user_id);

-- Users can delete their own weight logs
create policy "Users can delete own weight logs"
  on weight_log for delete
  using (auth.uid() = user_id);

-- Function to update updated_at timestamp
create or replace function update_weight_log_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create trigger weight_log_updated_at
  before update on weight_log
  for each row
  execute function update_weight_log_updated_at();

-- Add comment
comment on table weight_log is 'User bodyweight tracking logs';


