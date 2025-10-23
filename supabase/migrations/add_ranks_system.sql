-- Create rank scales table
CREATE TABLE IF NOT EXISTS public.rank_scale (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rank definitions table
CREATE TABLE IF NOT EXISTS public.rank_definition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scale_code TEXT NOT NULL REFERENCES public.rank_scale(code) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  min_xp INT NOT NULL,
  color TEXT,
  icon TEXT,
  sort_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(scale_code, code)
);

-- Create admin users table
CREATE TABLE IF NOT EXISTS public.admin_user (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alter user_gamification to add rank fields
ALTER TABLE public.user_gamification
ADD COLUMN IF NOT EXISTS rank_code TEXT,
ADD COLUMN IF NOT EXISTS pro_rank_code TEXT,
ADD COLUMN IF NOT EXISTS rank_scale_code TEXT DEFAULT 'free';

-- RLS Policies for rank_scale
ALTER TABLE public.rank_scale ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Rank scales are readable by authenticated users" ON public.rank_scale;
CREATE POLICY "Rank scales are readable by authenticated users"
ON public.rank_scale FOR SELECT
TO authenticated
USING (true);

-- RLS Policies for rank_definition
ALTER TABLE public.rank_definition ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Rank definitions are readable by authenticated users" ON public.rank_definition;
CREATE POLICY "Rank definitions are readable by authenticated users"
ON public.rank_definition FOR SELECT
TO authenticated
USING (true);

-- RLS Policies for admin_user
ALTER TABLE public.admin_user ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own admin status" ON public.admin_user;
CREATE POLICY "Users can read their own admin status"
ON public.admin_user FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Insert rank scales
INSERT INTO public.rank_scale (code, name) VALUES ('free', 'Free')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.rank_scale (code, name) VALUES ('pro', 'Pro')
ON CONFLICT (code) DO NOTHING;

-- Insert free rank definitions
INSERT INTO public.rank_definition (scale_code, code, name, min_xp, color, icon, sort_order) VALUES
('free', 'NOOB', 'Noob', 0, 'slate', 'dumbbell', 1),
('free', 'ROOKIE', 'Rookie', 100, 'sky', 'sparkles', 2),
('free', 'NOVICE', 'Novice', 300, 'indigo', 'star', 3),
('free', 'APPRENTICE', 'Apprentice', 600, 'violet', 'zap', 4),
('free', 'INTERMEDIATE', 'Intermediate', 1000, 'purple', 'award', 5),
('free', 'GYM_RAT', 'Gym Rat', 1600, 'amber', 'flame', 6),
('free', 'ATHLETE', 'Athlete', 2300, 'emerald', 'trophy', 7),
('free', 'POWERLIFTER', 'Powerlifter', 3200, 'cyan', 'dribbble', 8),
('free', 'BEAST', 'Beast', 4300, 'rose', 'skull', 9),
('free', 'BODYBUILDER', 'Bodybuilder', 5600, 'yellow', 'crown', 10)
ON CONFLICT (scale_code, code) DO NOTHING;

-- Create index for efficient rank lookups
CREATE INDEX IF NOT EXISTS idx_rank_definition_scale_xp 
ON public.rank_definition(scale_code, min_xp DESC);

-- Create index for gamification rank lookups
CREATE INDEX IF NOT EXISTS idx_user_gamification_rank 
ON public.user_gamification(rank_code, rank_scale_code);


