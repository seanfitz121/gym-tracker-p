-- Create table for tracking actual 1RM lifts
create table if not exists public.one_rm_lift (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profile(id) on delete cascade,
  exercise_id uuid not null references public.exercise(id) on delete cascade,
  weight numeric not null,
  weight_unit unit_weight not null default 'kg',
  set_entry_id uuid references public.set_entry(id) on delete set null,
  logged_at timestamptz not null default now(),
  notes text,
  created_at timestamptz default now(),
  unique(user_id, exercise_id, set_entry_id)
);

-- Create table for 1RM goals
create table if not exists public.one_rm_goal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profile(id) on delete cascade,
  exercise_id uuid not null references public.exercise(id) on delete cascade,
  target_weight numeric not null,
  weight_unit unit_weight not null default 'kg',
  target_date date,
  achieved boolean default false,
  achieved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, exercise_id)
);

-- Add indexes for performance
create index if not exists idx_one_rm_lift_user_exercise on public.one_rm_lift(user_id, exercise_id);
create index if not exists idx_one_rm_lift_logged_at on public.one_rm_lift(logged_at desc);
create index if not exists idx_one_rm_goal_user_exercise on public.one_rm_goal(user_id, exercise_id);

-- Enable RLS
alter table public.one_rm_lift enable row level security;
alter table public.one_rm_goal enable row level security;

-- RLS policies for one_rm_lift
create policy "Users can view their own 1RM lifts"
  on public.one_rm_lift for select
  using (user_id = auth.uid());

create policy "Users can insert their own 1RM lifts"
  on public.one_rm_lift for insert
  with check (user_id = auth.uid());

create policy "Users can update their own 1RM lifts"
  on public.one_rm_lift for update
  using (user_id = auth.uid());

create policy "Users can delete their own 1RM lifts"
  on public.one_rm_lift for delete
  using (user_id = auth.uid());

-- RLS policies for one_rm_goal
create policy "Users can view their own 1RM goals"
  on public.one_rm_goal for select
  using (user_id = auth.uid());

create policy "Users can insert their own 1RM goals"
  on public.one_rm_goal for insert
  with check (user_id = auth.uid());

create policy "Users can update their own 1RM goals"
  on public.one_rm_goal for update
  using (user_id = auth.uid());

create policy "Users can delete their own 1RM goals"
  on public.one_rm_goal for delete
  using (user_id = auth.uid());

-- Function to automatically detect and log 1RM lifts from set entries
create or replace function public.auto_log_one_rm()
returns trigger as $$
declare
  v_user_id uuid;
begin
  -- Only process if this is a 1-rep set that is not a warmup
  if NEW.reps = 1 and NEW.is_warmup = false then
    -- Get the user_id from the workout_session
    select user_id into v_user_id
    from public.workout_session
    where id = NEW.session_id;

    -- Insert or update the 1RM lift record
    insert into public.one_rm_lift (
      user_id,
      exercise_id,
      weight,
      weight_unit,
      set_entry_id,
      logged_at
    )
    values (
      v_user_id,
      NEW.exercise_id,
      NEW.weight,
      NEW.weight_unit,
      NEW.id,
      NEW.created_at
    )
    on conflict (user_id, exercise_id, set_entry_id)
    do update set
      weight = EXCLUDED.weight,
      weight_unit = EXCLUDED.weight_unit,
      logged_at = EXCLUDED.logged_at;

    -- Check if this achieves any 1RM goal
    update public.one_rm_goal
    set 
      achieved = true,
      achieved_at = now(),
      updated_at = now()
    where user_id = v_user_id
      and exercise_id = NEW.exercise_id
      and achieved = false
      and (
        (weight_unit = NEW.weight_unit and target_weight <= NEW.weight)
        or
        (weight_unit = 'kg' and NEW.weight_unit = 'lb' and target_weight <= NEW.weight * 0.453592)
        or
        (weight_unit = 'lb' and NEW.weight_unit = 'kg' and target_weight <= NEW.weight * 2.20462)
      );
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

-- Create trigger to auto-detect 1RM lifts
drop trigger if exists trigger_auto_log_one_rm on public.set_entry;
create trigger trigger_auto_log_one_rm
  after insert on public.set_entry
  for each row
  execute function public.auto_log_one_rm();

-- Create a view for easy 1RM progress tracking
create or replace view public.one_rm_progress as
select 
  l.id,
  l.user_id,
  l.exercise_id,
  e.name as exercise_name,
  e.body_part,
  l.weight,
  l.weight_unit,
  l.logged_at,
  l.notes,
  g.target_weight as goal_weight,
  g.weight_unit as goal_unit,
  g.target_date as goal_date,
  g.achieved as goal_achieved,
  case 
    when g.target_weight is not null and g.weight_unit = l.weight_unit then
      round((l.weight / g.target_weight * 100)::numeric, 1)
    when g.target_weight is not null and g.weight_unit = 'kg' and l.weight_unit = 'lb' then
      round((l.weight * 0.453592 / g.target_weight * 100)::numeric, 1)
    when g.target_weight is not null and g.weight_unit = 'lb' and l.weight_unit = 'kg' then
      round((l.weight * 2.20462 / g.target_weight * 100)::numeric, 1)
    else null
  end as goal_progress_percent
from public.one_rm_lift l
join public.exercise e on l.exercise_id = e.id
left join public.one_rm_goal g on l.user_id = g.user_id and l.exercise_id = g.exercise_id;

-- Grant access to the view
grant select on public.one_rm_progress to authenticated;

