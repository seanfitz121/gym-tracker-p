-- Add slug column to blog_post table for SEO-friendly URLs
ALTER TABLE public.blog_post 
ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_blog_post_slug ON public.blog_post(slug);

-- Add comment
COMMENT ON COLUMN public.blog_post.slug IS 'SEO-friendly URL slug for blog posts';

