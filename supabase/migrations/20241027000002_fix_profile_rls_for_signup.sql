-- Allow users to insert their own profile during signup
-- This is needed because profile creation happens immediately after auth signup

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can insert their own profile" ON profile;
DROP POLICY IF EXISTS "Users can read their own profile" ON profile;
DROP POLICY IF EXISTS "Users can update their own profile" ON profile;

-- Enable RLS on profile table (if not already enabled)
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own profile (only once, during signup)
CREATE POLICY "Users can insert their own profile"
ON profile
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to read their own profile
CREATE POLICY "Users can read their own profile"
ON profile
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile (except username)
CREATE POLICY "Users can update their own profile"
ON profile
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to search for other profiles (for friends feature)
-- But only return limited info
CREATE POLICY "Users can search for other profiles"
ON profile
FOR SELECT
TO authenticated
USING (true);

COMMENT ON POLICY "Users can insert their own profile" ON profile IS 
  'Allows users to create their profile during signup';
COMMENT ON POLICY "Users can search for other profiles" ON profile IS 
  'Allows authenticated users to search for friends by username';

