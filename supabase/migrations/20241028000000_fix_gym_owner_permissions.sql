-- Fix gym owner permissions to approve/reject join requests
-- Currently, gym owners cannot update gym_member records for pending members
-- because RLS only allows users to update their own memberships

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can update their own membership" ON gym_member;

-- Create new policies that allow:
-- 1. Users to update their own membership (opt_in, etc.)
-- 2. Gym owners to update memberships in their gym (approve/reject)

-- Policy 1: Users can update their own membership settings (opt_in, etc.)
CREATE POLICY "Users can update their own membership settings"
  ON gym_member FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 2: Gym owners can update memberships in their gym (for approvals)
CREATE POLICY "Gym owners can manage their gym memberships"
  ON gym_member FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM gym
      WHERE gym.code = gym_member.gym_code
        AND gym.owner_id = auth.uid()
    )
  );

-- Also add a comment explaining the policies
COMMENT ON POLICY "Users can update their own membership settings" ON gym_member IS 
  'Allows users to update their own gym membership settings (opt_in, etc.)';

COMMENT ON POLICY "Gym owners can manage their gym memberships" ON gym_member IS 
  'Allows gym owners to approve/reject join requests and manage memberships in their gym';

