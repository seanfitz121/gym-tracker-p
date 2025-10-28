# Quick Fix: Apply Progress Photo Trigger Fix

## The Problem

The database trigger for `progress_photo` was trying to access `new.user_id` on DELETE operations, but `new` doesn't exist during deletes (only `old` does). This caused all photo deletions to fail with "Failed to delete photo from database".

## The Solution

A fixed migration has been created: `supabase/migrations/20241028100001_fix_progress_photo_trigger.sql`

## Apply the Fix (Choose One Method)

### Method 1: Using Supabase CLI (Recommended)

```bash
supabase db push
```

### Method 2: Manual SQL (If you don't have CLI)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste this SQL:

```sql
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
```

4. Click **Run**

## Verify the Fix

After applying:

1. Refresh your browser
2. Try deleting a photo
3. Should see: ✅ "Photo deleted successfully"
4. Photo card should disappear from gallery

## What Changed

The trigger function now:
- ✅ Uses `old.user_id` for DELETE operations
- ✅ Uses `new.user_id` for INSERT/UPDATE operations
- ✅ Returns the correct record type for each operation
- ✅ Properly updates storage tracking table

---

**Status**: Ready to apply
**Time**: < 30 seconds

