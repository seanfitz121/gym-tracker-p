# Gym Approval Not Working - RLS Policy Fix

## Root Cause

The gym approval feature was failing silently due to a **Row Level Security (RLS)** policy issue.

### The Problem

The existing RLS policy on `gym_member` table:

```sql
create policy "Users can update their own membership"
  on gym_member for update
  using (auth.uid() = user_id);
```

This policy **only allows users to update their own membership**. 

When a gym owner tries to approve a pending request:
- They're trying to update `gym_member.is_approved = true`
- But the `user_id` is the **requesting user**, not the gym owner
- RLS blocks the update ❌
- No error is thrown (fails silently)
- Frontend shows optimistic update, but database never changes
- After refresh, the request reappears

## The Fix

Created a new migration that adds a policy allowing gym owners to manage memberships in their gym.

### File: `supabase/migrations/20241028000000_fix_gym_owner_permissions.sql`

```sql
-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can update their own membership" ON gym_member;

-- Policy 1: Users can update their own membership settings
CREATE POLICY "Users can update their own membership settings"
  ON gym_member FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 2: Gym owners can update memberships in their gym
CREATE POLICY "Gym owners can manage their gym memberships"
  ON gym_member FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM gym
      WHERE gym.code = gym_member.gym_code
        AND gym.owner_id = auth.uid()
    )
  );
```

### How It Works

Now there are **two** update policies:

1. **Users can update their own settings**: Members can update their `opt_in` status
2. **Gym owners can manage memberships**: Owners can approve/reject requests in their gym

The RLS system uses **OR** logic - if ANY policy allows the action, it proceeds.

## How to Apply the Fix

### Option 1: Supabase Dashboard (Recommended for hosted Supabase)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20241028000000_fix_gym_owner_permissions.sql`
4. Paste into the SQL editor
5. Click **Run**

### Option 2: Supabase CLI (If using local Supabase)

```bash
# Make sure you're in the project directory
cd d:\gym-web

# Apply the migration
supabase db push
```

### Option 3: Manual SQL (Alternative)

Run this SQL directly in your database:

```sql
-- Drop the old policy
DROP POLICY IF EXISTS "Users can update their own membership" ON gym_member;

-- Add new policies
CREATE POLICY "Users can update their own membership settings"
  ON gym_member FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Gym owners can manage their gym memberships"
  ON gym_member FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM gym
      WHERE gym.code = gym_member.gym_code
        AND gym.owner_id = auth.uid()
    )
  );
```

## Testing After Migration

1. **Refresh your browser** (CTRL+R)
2. **Have a pending join request** in your gym
3. **Click "Approve"**
4. **Verify**:
   - ✅ Request card disappears
   - ✅ Member count increments
   - ✅ Click "X members" to view members list
   - ✅ New member appears in the list
   - ✅ After refresh, request STAYS gone

## Why This Happened

This is a common mistake with RLS policies. The original migration was too restrictive:

- ❌ Old: Only the user themselves can update their membership
- ✅ New: User can update their own, OR gym owner can update any membership in their gym

## Security Notes

The new policy is still secure because:
- Gym owners can ONLY update memberships in gyms they own
- Users can ONLY update their own membership
- The `EXISTS` subquery ensures ownership verification
- Other users cannot update memberships they don't own or aren't the gym owner of

## Verification Query

To verify the policies are applied correctly, run:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'gym_member'
  AND policyname LIKE '%update%';
```

You should see:
1. `Users can update their own membership settings`
2. `Gym owners can manage their gym memberships`

## Other Tables That Might Need Similar Fixes

If you encounter similar issues with other features, check these policies:
- `gym_member` ✅ (fixed with this migration)
- `friend_request` (seems fine - users manage their own requests)
- `friend` (seems fine - uses OR logic already)
- `gym` (owners can update their own gyms)

