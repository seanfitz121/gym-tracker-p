-- Create patch_notes table
CREATE TABLE IF NOT EXISTS public.patch_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.patch_notes ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view published patch notes
CREATE POLICY "Anyone can view published patch notes"
  ON public.patch_notes
  FOR SELECT
  USING (auth.role() = 'authenticated' AND published = true);

-- Allow admins to view all patch notes (including drafts)
CREATE POLICY "Admins can view all patch notes"
  ON public.patch_notes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_user
      WHERE user_id = auth.uid()
    )
  );

-- Allow admins to insert patch notes
CREATE POLICY "Admins can insert patch notes"
  ON public.patch_notes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_user
      WHERE user_id = auth.uid()
    )
  );

-- Allow admins to update patch notes
CREATE POLICY "Admins can update patch notes"
  ON public.patch_notes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_user
      WHERE user_id = auth.uid()
    )
  );

-- Allow admins to delete patch notes
CREATE POLICY "Admins can delete patch notes"
  ON public.patch_notes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_user
      WHERE user_id = auth.uid()
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_patch_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patch_notes_updated_at
  BEFORE UPDATE ON public.patch_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_patch_notes_updated_at();

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS patch_notes_created_at_idx ON public.patch_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS patch_notes_author_id_idx ON public.patch_notes(author_id);
CREATE INDEX IF NOT EXISTS patch_notes_version_idx ON public.patch_notes(version);

