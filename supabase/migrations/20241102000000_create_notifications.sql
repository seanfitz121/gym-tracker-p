-- Create push_subscriptions table
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, endpoint)
);

-- Create notifications table (in-app notifications)
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in (
    'friend_request',
    'workout_reminder',
    'community_interaction',
    'patch_notes',
    'gym_expiry'
  )),
  title text not null,
  body text not null,
  data jsonb,
  read boolean default false,
  created_at timestamptz default now(),
  read_at timestamptz
);

-- Create notification preferences table
create table if not exists notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  friend_requests boolean default true,
  workout_reminders boolean default true,
  community_interactions boolean default true,
  patch_notes boolean default true,
  gym_expiry boolean default true,
  push_enabled boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_push_subscriptions_user_id on push_subscriptions(user_id);
create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_notifications_read on notifications(user_id, read);
create index if not exists idx_notifications_created_at on notifications(user_id, created_at desc);

-- Enable RLS
alter table push_subscriptions enable row level security;
alter table notifications enable row level security;
alter table notification_preferences enable row level security;

-- RLS Policies for push_subscriptions
create policy "Users can view their own push subscriptions"
  on push_subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own push subscriptions"
  on push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own push subscriptions"
  on push_subscriptions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own push subscriptions"
  on push_subscriptions for delete
  using (auth.uid() = user_id);

-- RLS Policies for notifications
create policy "Users can view their own notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on notifications for update
  using (auth.uid() = user_id);

-- RLS Policies for notification_preferences
create policy "Users can view their own notification preferences"
  on notification_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert their own notification preferences"
  on notification_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own notification preferences"
  on notification_preferences for update
  using (auth.uid() = user_id);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers
create trigger update_push_subscriptions_updated_at
  before update on push_subscriptions
  for each row
  execute function update_updated_at_column();

create trigger update_notification_preferences_updated_at
  before update on notification_preferences
  for each row
  execute function update_updated_at_column();

-- Function to create default notification preferences
create or replace function create_default_notification_preferences()
returns trigger as $$
begin
  insert into notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create default preferences on user creation
create trigger create_user_notification_preferences
  after insert on auth.users
  for each row
  execute function create_default_notification_preferences();

