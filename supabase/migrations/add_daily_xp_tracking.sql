-- Add daily XP tracking field for anti-cheat measures
-- Run this if you already have the database set up

ALTER TABLE public.user_gamification 
ADD COLUMN IF NOT EXISTS daily_xp_earned INT NOT NULL DEFAULT 0;

-- Add comment explaining the field
COMMENT ON COLUMN public.user_gamification.daily_xp_earned IS 'Tracks XP earned today for anti-cheat (resets daily, max 500)';


