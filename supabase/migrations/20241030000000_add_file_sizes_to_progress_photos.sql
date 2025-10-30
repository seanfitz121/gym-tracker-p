-- Add file size columns to progress_photo table
-- This allows proper storage calculation without querying storage bucket

-- Add size columns
alter table progress_photo 
  add column if not exists thumb_size_bytes bigint default 0,
  add column if not exists medium_size_bytes bigint default 0,
  add column if not exists original_size_bytes bigint default 0;

-- Update the storage calculation function to actually calculate from photo sizes
create or replace function update_progress_photo_storage()
returns trigger as $$
declare
  target_user_id uuid;
  calculated_total bigint;
begin
  -- Determine which user_id to use based on operation
  if TG_OP = 'DELETE' then
    target_user_id := old.user_id;
  else
    target_user_id := new.user_id;
  end if;
  
  -- Calculate total storage from all photos for this user
  select coalesce(sum(
    coalesce(thumb_size_bytes, 0) + 
    coalesce(medium_size_bytes, 0) + 
    coalesce(original_size_bytes, 0)
  ), 0)
  into calculated_total
  from progress_photo
  where user_id = target_user_id;
  
  -- Upsert the storage record with calculated total
  insert into progress_photo_storage (user_id, total_bytes, updated_at)
  values (target_user_id, calculated_total, now())
  on conflict (user_id) do update
  set 
    total_bytes = calculated_total,
    updated_at = now();
  
  -- Return appropriate record based on operation
  if TG_OP = 'DELETE' then
    return old;
  else
    return new;
  end if;
end;
$$ language plpgsql security definer;

-- Drop and recreate the trigger to ensure it uses the new function
drop trigger if exists progress_photo_storage_trigger on progress_photo;

create trigger progress_photo_storage_trigger
  after insert or update or delete on progress_photo
  for each row
  execute function update_progress_photo_storage();

-- Recalculate storage for all existing users
-- This handles any existing photos (sets sizes to 0 for now, will be correct on next upload)
insert into progress_photo_storage (user_id, total_bytes, updated_at)
select 
  user_id,
  0 as total_bytes,
  now() as updated_at
from progress_photo
group by user_id
on conflict (user_id) do update
set 
  total_bytes = 0,
  updated_at = now();

