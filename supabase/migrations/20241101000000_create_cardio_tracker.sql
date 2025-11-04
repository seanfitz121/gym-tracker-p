-- Cardio Tracker Migration
-- Tracks cardio sessions and intervals for various machine types

-- Create cardio_session table
create table if not exists public.cardio_session (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cardio_type text not null check (cardio_type in (
    'treadmill', 'bike', 'rower', 'elliptical', 'stair_climber', 
    'ski_erg', 'treadmill_incline_walk', 'outdoor_run'
  )),
  mode text not null check (mode in ('manual', 'timer', 'interval')),
  total_duration integer not null check (total_duration > 0), -- seconds
  total_distance numeric, -- stored in meters (convert from km/miles on input)
  avg_pace numeric, -- seconds per km
  calories integer,
  avg_hr integer check (avg_hr > 0 and avg_hr <= 250),
  max_hr integer check (max_hr > 0 and max_hr <= 250),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create cardio_interval table
create table if not exists public.cardio_interval (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.cardio_session(id) on delete cascade,
  label text,
  duration integer not null check (duration > 0), -- seconds
  distance numeric, -- meters
  avg_pace numeric, -- seconds per km
  incline numeric check (incline >= 0 and incline <= 100), -- percent
  resistance integer check (resistance >= 0 and resistance <= 100), -- 0-100 scale
  avg_hr integer check (avg_hr > 0 and avg_hr <= 250),
  max_hr integer check (max_hr > 0 and max_hr <= 250),
  rpe integer check (rpe >= 1 and rpe <= 10), -- Rate of Perceived Exertion
  order_index integer not null default 0,
  created_at timestamptz default now()
);

-- Create indexes for performance
create index if not exists idx_cardio_session_user_id on public.cardio_session(user_id);
create index if not exists idx_cardio_session_created_at on public.cardio_session(created_at desc);
create index if not exists idx_cardio_session_cardio_type on public.cardio_session(cardio_type);
create index if not exists idx_cardio_interval_session_id on public.cardio_interval(session_id);
create index if not exists idx_cardio_interval_order on public.cardio_interval(session_id, order_index);

-- Enable RLS
alter table public.cardio_session enable row level security;
alter table public.cardio_interval enable row level security;

-- RLS policies for cardio_session
create policy "Users can view their own cardio sessions"
  on public.cardio_session for select
  using (user_id = auth.uid());

create policy "Users can insert their own cardio sessions"
  on public.cardio_session for insert
  with check (user_id = auth.uid());

create policy "Users can update their own cardio sessions"
  on public.cardio_session for update
  using (user_id = auth.uid());

create policy "Users can delete their own cardio sessions"
  on public.cardio_session for delete
  using (user_id = auth.uid());

-- RLS policies for cardio_interval
create policy "Users can view intervals for their own sessions"
  on public.cardio_interval for select
  using (
    exists (
      select 1 from public.cardio_session
      where cardio_session.id = cardio_interval.session_id
      and cardio_session.user_id = auth.uid()
    )
  );

create policy "Users can insert intervals for their own sessions"
  on public.cardio_interval for insert
  with check (
    exists (
      select 1 from public.cardio_session
      where cardio_session.id = cardio_interval.session_id
      and cardio_session.user_id = auth.uid()
    )
  );

create policy "Users can update intervals for their own sessions"
  on public.cardio_interval for update
  using (
    exists (
      select 1 from public.cardio_session
      where cardio_session.id = cardio_interval.session_id
      and cardio_session.user_id = auth.uid()
    )
  );

create policy "Users can delete intervals for their own sessions"
  on public.cardio_interval for delete
  using (
    exists (
      select 1 from public.cardio_session
      where cardio_session.id = cardio_interval.session_id
      and cardio_session.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
create or replace function public.update_cardio_session_updated_at()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
drop trigger if exists trigger_update_cardio_session_updated_at on public.cardio_session;
create trigger trigger_update_cardio_session_updated_at
  before update on public.cardio_session
  for each row
  execute function public.update_cardio_session_updated_at();

-- Function to calculate total distance from intervals
create or replace function public.calculate_cardio_session_distance(
  p_session_id uuid
)
returns numeric as $$
  select coalesce(sum(distance), 0)
  from public.cardio_interval
  where session_id = p_session_id;
$$ language sql stable;

-- Function to calculate average pace from intervals
create or replace function public.calculate_cardio_session_avg_pace(
  p_session_id uuid
)
returns numeric as $$
declare
  v_total_distance numeric;
  v_total_duration integer;
begin
  select 
    coalesce(sum(distance), 0),
    coalesce(sum(duration), 0)
  into v_total_distance, v_total_duration
  from public.cardio_interval
  where session_id = p_session_id
    and distance is not null
    and distance > 0;
  
  if v_total_distance > 0 and v_total_duration > 0 then
    return (v_total_duration / v_total_distance) * 1000; -- seconds per km
  else
    return null;
  end if;
end;
$$ language plpgsql stable;

-- Comments
comment on table public.cardio_session is 'Cardio workout sessions with various machine types';
comment on table public.cardio_interval is 'Individual intervals within a cardio session';
comment on column public.cardio_session.total_distance is 'Total distance in meters';
comment on column public.cardio_interval.distance is 'Interval distance in meters';
comment on column public.cardio_session.avg_pace is 'Average pace in seconds per kilometer';
comment on column public.cardio_interval.avg_pace is 'Interval pace in seconds per kilometer';

