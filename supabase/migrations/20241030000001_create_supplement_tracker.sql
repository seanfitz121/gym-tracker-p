-- Supplement Tracker Feature (Premium)
-- Allows premium users to track daily supplement intake

-- Supplement definitions (user's custom supplements)
CREATE TABLE IF NOT EXISTS supplement_definition (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pills', 'tablets', 'powder', 'capsule', 'liquid', 'other')),
  unit TEXT NOT NULL, -- e.g., 'g', 'mg', 'scoops', 'capsules', 'ml'
  daily_goal DECIMAL(10, 2) NOT NULL DEFAULT 0, -- target amount per day
  color TEXT, -- hex color for visual identification
  icon TEXT, -- icon name/emoji for display
  reminder_enabled BOOLEAN DEFAULT false,
  reminder_time TIME, -- time of day for reminder (HH:MM)
  is_quantitative BOOLEAN DEFAULT true, -- false for simple yes/no tracking (like multivitamin)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Supplement logs (daily intake entries)
CREATE TABLE IF NOT EXISTS supplement_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplement_id UUID NOT NULL REFERENCES supplement_definition(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0, -- amount taken
  taken_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- when it was taken
  date DATE NOT NULL DEFAULT CURRENT_DATE, -- date for grouping/queries
  notes TEXT, -- optional notes
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS supplement_definition_user_id_idx ON supplement_definition(user_id);
CREATE INDEX IF NOT EXISTS supplement_log_user_id_idx ON supplement_log(user_id);
CREATE INDEX IF NOT EXISTS supplement_log_supplement_id_idx ON supplement_log(supplement_id);
CREATE INDEX IF NOT EXISTS supplement_log_date_idx ON supplement_log(date);
CREATE INDEX IF NOT EXISTS supplement_log_user_date_idx ON supplement_log(user_id, date);

-- Enable RLS
ALTER TABLE supplement_definition ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for supplement_definition
CREATE POLICY "Users can view their own supplement definitions"
  ON supplement_definition
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own supplement definitions"
  ON supplement_definition
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own supplement definitions"
  ON supplement_definition
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own supplement definitions"
  ON supplement_definition
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for supplement_log
CREATE POLICY "Users can view their own supplement logs"
  ON supplement_log
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own supplement logs"
  ON supplement_log
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own supplement logs"
  ON supplement_log
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own supplement logs"
  ON supplement_log
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_supplement_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER supplement_definition_updated_at
  BEFORE UPDATE ON supplement_definition
  FOR EACH ROW
  EXECUTE FUNCTION update_supplement_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON supplement_definition TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON supplement_log TO authenticated;

-- View for daily supplement progress (helpful for queries)
CREATE OR REPLACE VIEW supplement_daily_progress AS
SELECT 
  sl.user_id,
  sl.supplement_id,
  sd.name,
  sd.unit,
  sd.daily_goal,
  sd.is_quantitative,
  sl.date,
  COALESCE(SUM(sl.amount), 0) as total_taken,
  CASE 
    WHEN sd.daily_goal > 0 THEN (COALESCE(SUM(sl.amount), 0) / sd.daily_goal * 100)
    ELSE 0
  END as progress_percentage,
  COUNT(sl.id) as log_count
FROM supplement_definition sd
LEFT JOIN supplement_log sl ON sd.id = sl.supplement_id AND sl.date = CURRENT_DATE
WHERE sd.user_id = auth.uid()
GROUP BY sl.user_id, sl.supplement_id, sd.id, sd.name, sd.unit, sd.daily_goal, sd.is_quantitative, sl.date;

-- Grant view access
GRANT SELECT ON supplement_daily_progress TO authenticated;

