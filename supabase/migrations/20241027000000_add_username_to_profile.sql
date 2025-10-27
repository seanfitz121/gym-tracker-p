-- Add username column to profile table
ALTER TABLE profile ADD COLUMN username TEXT;

-- Add unique constraint on username
CREATE UNIQUE INDEX profile_username_unique ON profile(username);

-- For existing users, generate temporary usernames from their email or ID
-- This will need to be updated by users on first login
UPDATE profile 
SET username = 'user_' || substr(id::text, 1, 8)
WHERE username IS NULL;

-- Make username NOT NULL after populating existing rows
ALTER TABLE profile ALTER COLUMN username SET NOT NULL;

-- Add check constraint to ensure username meets requirements
-- Username must be 3-20 characters, alphanumeric plus underscore and hyphen
ALTER TABLE profile ADD CONSTRAINT username_format 
  CHECK (username ~ '^[a-zA-Z0-9_-]{3,20}$');

-- Add comment
COMMENT ON COLUMN profile.username IS 'Unique username for the user (3-20 characters, alphanumeric with _ and -)';

