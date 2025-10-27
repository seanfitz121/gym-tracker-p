-- Fix the handle_new_user trigger to include username
-- This function is called automatically when a new user signs up

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Updated function that includes username from user metadata or generates one
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_username TEXT;
BEGIN
  -- Try to get username from user metadata (set during signup)
  new_username := new.raw_user_meta_data->>'username';
  
  -- If no username in metadata, generate one from user ID
  IF new_username IS NULL OR new_username = '' THEN
    new_username := 'user_' || substr(new.id::text, 1, 8);
  END IF;
  
  -- Create profile with username
  INSERT INTO public.profile (id, username, display_name)
  VALUES (
    new.id, 
    new_username,
    COALESCE(new.raw_user_meta_data->>'username', new.email)
  );
  
  -- Create gamification record
  INSERT INTO public.user_gamification (user_id, rank_code, rank_scale_code)
  VALUES (new.id, 'NOOB', 'free');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user IS 
  'Automatically creates profile and gamification records when a new user signs up. Uses username from metadata or generates one.';

