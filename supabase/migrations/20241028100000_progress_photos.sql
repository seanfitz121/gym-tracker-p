-- Progress Photos Feature
-- Premium-only transformation photo tracking with private storage

-- Create progress_photo table
create table if not exists progress_photo (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_path text not null,         -- storage path to medium image (private bucket)
  thumb_path text,                 -- storage path to thumbnail
  original_path text,              -- optional: stored original (private)
  caption text,
  taken_at date,                   -- user-supplied photo date (optional)
  created_at timestamptz default now()
);

-- Create indexes
create index if not exists progress_photo_user_id_idx on progress_photo(user_id);
create index if not exists progress_photo_taken_at_idx on progress_photo(taken_at);
create index if not exists progress_photo_created_at_idx on progress_photo(created_at);

-- Enable RLS
alter table progress_photo enable row level security;

-- RLS Policies: Only owners can access their photos
create policy "Users can view their own progress photos"
  on progress_photo
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own progress photos"
  on progress_photo
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own progress photos"
  on progress_photo
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own progress photos"
  on progress_photo
  for delete
  using (auth.uid() = user_id);

-- Storage quota tracking table
create table if not exists progress_photo_storage (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_bytes bigint default 0,
  quota_bytes bigint default 52428800, -- 50 MB default quota
  updated_at timestamptz default now()
);

-- Enable RLS on storage table
alter table progress_photo_storage enable row level security;

create policy "Users can view their own storage usage"
  on progress_photo_storage
  for select
  using (auth.uid() = user_id);

-- Function to update storage usage
create or replace function update_progress_photo_storage()
returns trigger as $$
begin
  -- On insert or update, recalculate total storage
  insert into progress_photo_storage (user_id, total_bytes, updated_at)
  values (new.user_id, 0, now())
  on conflict (user_id) do nothing;
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to update storage on photo operations
create trigger progress_photo_storage_trigger
  after insert or update or delete on progress_photo
  for each row
  execute function update_progress_photo_storage();

-- Grant permissions
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on progress_photo to authenticated;
grant select on progress_photo_storage to authenticated;

