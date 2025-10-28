-- Fix progress_photo trigger to handle DELETE operations correctly

-- Drop existing trigger and function
drop trigger if exists progress_photo_storage_trigger on progress_photo;
drop function if exists update_progress_photo_storage();

-- Create fixed function that handles INSERT, UPDATE, and DELETE
create or replace function update_progress_photo_storage()
returns trigger as $$
declare
  target_user_id uuid;
begin
  -- Determine which user_id to use based on operation
  if TG_OP = 'DELETE' then
    target_user_id := old.user_id;
  else
    target_user_id := new.user_id;
  end if;
  
  -- Ensure storage record exists for the user
  insert into progress_photo_storage (user_id, total_bytes, updated_at)
  values (target_user_id, 0, now())
  on conflict (user_id) do update
  set updated_at = now();
  
  -- Return appropriate record based on operation
  if TG_OP = 'DELETE' then
    return old;
  else
    return new;
  end if;
end;
$$ language plpgsql security definer;

-- Recreate trigger
create trigger progress_photo_storage_trigger
  after insert or update or delete on progress_photo
  for each row
  execute function update_progress_photo_storage();

