-- Add premium-related columns to profile table
-- This migration must run BEFORE prestige_mode_and_flair migration

-- 1. Add columns to profile
alter table profile
  add column if not exists is_premium boolean default false,
  add column if not exists premium_flair_enabled boolean default true;

-- 2. Create indexes for performance
create index if not exists profile_is_premium_idx on profile(is_premium);
create index if not exists profile_premium_flair_idx on profile(premium_flair_enabled);

-- 3. Create function to sync is_premium from subscription table
create or replace function sync_profile_premium_status()
returns trigger as $$
begin
  -- Update profile.is_premium based on subscription status
  update profile
  set is_premium = (new.status in ('active', 'trialing'))
  where id = new.user_id;
  
  return new;
end;
$$ language plpgsql security definer;

-- 4. Create trigger to auto-sync premium status
drop trigger if exists premium_subscription_sync_trigger on premium_subscription;
create trigger premium_subscription_sync_trigger
  after insert or update on premium_subscription
  for each row
  execute function sync_profile_premium_status();

-- 5. Initial sync: update all existing profiles based on current subscriptions
update profile p
set is_premium = (
  select ps.status in ('active', 'trialing')
  from premium_subscription ps
  where ps.user_id = p.id
  limit 1
)
where exists (
  select 1 from premium_subscription ps where ps.user_id = p.id
);

-- 6. Add comment for documentation
comment on column profile.is_premium is 'Cached premium status, synced from premium_subscription table';
comment on column profile.premium_flair_enabled is 'User preference to show/hide golden name flair (Premium feature)';

