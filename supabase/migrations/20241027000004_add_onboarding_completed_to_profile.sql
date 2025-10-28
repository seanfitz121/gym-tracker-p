-- Add onboarding_completed flag to profile table
ALTER TABLE profile ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

COMMENT ON COLUMN profile.onboarding_completed IS 'Tracks if user has completed the initial onboarding tour';

-- Optionally: Set existing users as having completed onboarding if you don't want them to see it
-- UPDATE profile SET onboarding_completed = true WHERE created_at < NOW();

-- New users will get onboarding_completed = false by default

