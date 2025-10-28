-- Prestige Mode & Golden Name Flair - Premium Features
-- Adds prestige progression system and cosmetic golden name flair

-- 1. Add Prestige Mode fields to user_gamification
alter table user_gamification
  add column if not exists prestige_count int default 0,
  add column if not exists last_prestige_at timestamptz,
  add column if not exists prestige_active boolean default false;

-- Add indexes for prestige queries
create index if not exists user_gamification_prestige_count_idx on user_gamification(prestige_count);
create index if not exists user_gamification_last_prestige_at_idx on user_gamification(last_prestige_at);

-- 2. Add Golden Name Flair to profile
alter table profile
  add column if not exists premium_flair_enabled boolean default true;

create index if not exists profile_premium_flair_idx on profile(premium_flair_enabled);

-- 3. Create prestige history table for audit trail
create table if not exists prestige_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prestige_number int not null,
  xp_before bigint not null,
  level_before int not null,
  xp_after bigint not null,
  level_after int not null,
  created_at timestamptz default now()
);

-- Add indexes
create index if not exists prestige_history_user_id_idx on prestige_history(user_id);
create index if not exists prestige_history_created_at_idx on prestige_history(created_at);

-- Enable RLS
alter table prestige_history enable row level security;

-- RLS Policies for prestige_history
create policy "Users can view their own prestige history"
  on prestige_history
  for select
  using (auth.uid() = user_id);

create policy "System can insert prestige history"
  on prestige_history
  for insert
  with check (auth.uid() = user_id);

-- 4. Function to check prestige eligibility
create or replace function can_enter_prestige(p_user_id uuid)
returns jsonb as $$
declare
  v_is_premium boolean;
  v_current_xp bigint;
  v_prestige_count int;
  v_last_prestige_at timestamptz;
  v_rank_code text;
  v_cooldown_days int := 30;
  v_result jsonb;
  v_next_eligible_at timestamptz;
  v_bodybuilder_threshold bigint := 50000; -- XP threshold for BODYBUILDER rank
begin
  -- Get user data
  select 
    p.is_premium,
    ug.total_xp,
    ug.prestige_count,
    ug.last_prestige_at,
    ug.rank_code
  into
    v_is_premium,
    v_current_xp,
    v_prestige_count,
    v_last_prestige_at,
    v_rank_code
  from profile p
  left join user_gamification ug on ug.user_id = p.id
  where p.id = p_user_id;

  -- Check if premium
  if not v_is_premium then
    return jsonb_build_object(
      'eligible', false,
      'reason', 'Premium subscription required',
      'prestige_count', coalesce(v_prestige_count, 0)
    );
  end if;

  -- Check rank/XP threshold (must be at top free rank or have enough XP)
  if v_rank_code != 'BODYBUILDER' and coalesce(v_current_xp, 0) < v_bodybuilder_threshold then
    return jsonb_build_object(
      'eligible', false,
      'reason', 'Must reach BODYBUILDER rank (50,000 XP) to prestige',
      'prestige_count', coalesce(v_prestige_count, 0),
      'current_xp', v_current_xp,
      'required_xp', v_bodybuilder_threshold
    );
  end if;

  -- Check cooldown
  if v_last_prestige_at is not null then
    v_next_eligible_at := v_last_prestige_at + interval '30 days';
    if now() < v_next_eligible_at then
      return jsonb_build_object(
        'eligible', false,
        'reason', 'Prestige cooldown active',
        'prestige_count', v_prestige_count,
        'last_prestige_at', v_last_prestige_at,
        'next_eligible_at', v_next_eligible_at,
        'days_remaining', extract(days from v_next_eligible_at - now())
      );
    end if;
  end if;

  -- All checks passed
  return jsonb_build_object(
    'eligible', true,
    'prestige_count', coalesce(v_prestige_count, 0),
    'current_xp', v_current_xp
  );
end;
$$ language plpgsql security definer;

-- 5. Function to execute prestige
create or replace function enter_prestige(p_user_id uuid)
returns jsonb as $$
declare
  v_eligibility jsonb;
  v_old_xp bigint;
  v_old_level int;
  v_new_prestige_count int;
  v_badge_name text;
  v_result jsonb;
begin
  -- Check eligibility
  v_eligibility := can_enter_prestige(p_user_id);
  
  if not (v_eligibility->>'eligible')::boolean then
    return jsonb_build_object(
      'success', false,
      'error', v_eligibility->>'reason'
    );
  end if;

  -- Get current state
  select total_xp, level, prestige_count
  into v_old_xp, v_old_level, v_new_prestige_count
  from user_gamification
  where user_id = p_user_id;

  -- Increment prestige
  v_new_prestige_count := coalesce(v_new_prestige_count, 0) + 1;
  v_badge_name := 'PRESTIGE_' || v_new_prestige_count;

  -- Reset XP and level
  update user_gamification
  set 
    xp = 0,
    level = 1,
    prestige_count = v_new_prestige_count,
    last_prestige_at = now(),
    prestige_active = true
  where user_id = p_user_id;

  -- Create prestige history record
  insert into prestige_history (user_id, prestige_number, xp_before, level_before, xp_after, level_after)
  values (p_user_id, v_new_prestige_count, v_old_xp, v_old_level, 0, 1);

  -- Award prestige badge
  insert into user_badge (user_id, badge_code, earned_at)
  values (p_user_id, v_badge_name, now())
  on conflict (user_id, badge_code) do nothing;

  -- Log activity
  insert into activity_log (user_id, action_type, details)
  values (p_user_id, 'prestige', jsonb_build_object(
    'prestige_count', v_new_prestige_count,
    'xp_before', v_old_xp,
    'level_before', v_old_level
  ));

  return jsonb_build_object(
    'success', true,
    'prestige_count', v_new_prestige_count,
    'badge_name', v_badge_name,
    'next_eligible_at', now() + interval '30 days'
  );
end;
$$ language plpgsql security definer;

-- Grant permissions
grant select on prestige_history to authenticated;
grant execute on function can_enter_prestige(uuid) to authenticated;
grant execute on function enter_prestige(uuid) to authenticated;

-- Comments
comment on table prestige_history is 'Audit trail of prestige mode resets';
comment on function can_enter_prestige is 'Check if user is eligible to enter prestige mode';
comment on function enter_prestige is 'Execute prestige mode reset for eligible user';
comment on column user_gamification.prestige_count is 'Number of times user has prestiged';
comment on column user_gamification.last_prestige_at is 'Timestamp of last prestige reset';
comment on column user_gamification.prestige_active is 'Whether user is currently in prestige mode';
comment on column profile.premium_flair_enabled is 'Whether user wants golden name flair displayed';

