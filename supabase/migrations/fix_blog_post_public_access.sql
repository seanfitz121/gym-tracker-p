-- Fix blog_post RLS to allow public read access to published posts
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_post;

-- Create new policy that allows public (unauthenticated) access to published posts
CREATE POLICY "Public can view published blog posts"
  ON public.blog_post
  FOR SELECT
  USING (published = true);

-- Note: The "Admins can view all blog posts" policy remains unchanged and will still work
-- because policies are combined with OR logic


