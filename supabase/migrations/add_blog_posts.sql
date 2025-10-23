-- Create blog_post table
CREATE TABLE IF NOT EXISTS public.blog_post (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  subtitle text,
  cover_image_url text,
  body text NOT NULL,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.blog_post ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view published posts
CREATE POLICY "Anyone can view published blog posts"
  ON public.blog_post
  FOR SELECT
  USING (auth.role() = 'authenticated' AND published = true);

-- Allow admins to view all posts (including drafts)
CREATE POLICY "Admins can view all blog posts"
  ON public.blog_post
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_user
      WHERE user_id = auth.uid()
    )
  );

-- Allow admins to insert posts
CREATE POLICY "Admins can insert blog posts"
  ON public.blog_post
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_user
      WHERE user_id = auth.uid()
    )
  );

-- Allow admins to update posts
CREATE POLICY "Admins can update blog posts"
  ON public.blog_post
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_user
      WHERE user_id = auth.uid()
    )
  );

-- Allow admins to delete posts
CREATE POLICY "Admins can delete blog posts"
  ON public.blog_post
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_user
      WHERE user_id = auth.uid()
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_blog_post_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_post_updated_at
  BEFORE UPDATE ON public.blog_post
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_post_updated_at();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS blog_post_created_at_idx ON public.blog_post(created_at DESC);
CREATE INDEX IF NOT EXISTS blog_post_author_id_idx ON public.blog_post(author_id);

