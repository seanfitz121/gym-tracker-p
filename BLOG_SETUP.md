# Blog Feature Setup Guide

## Database Setup

### 1. Run the Migration

Connect to your Supabase project and run the migration:

```bash
# Using Supabase CLI
supabase db push

# OR manually in SQL Editor
```

Copy and paste the contents of `supabase/migrations/add_blog_posts.sql` into your Supabase SQL Editor and run it.

### 2. Verify the Table

Check that the `blog_post` table was created:

```sql
SELECT * FROM blog_post;
```

### 3. Test Permissions

As an admin user, try creating a test post:

```sql
INSERT INTO blog_post (author_id, title, subtitle, body, published)
VALUES (
  'YOUR_USER_ID',  -- Replace with your actual user ID
  'Welcome to Plate Progress Blog',
  'Your fitness journey starts here',
  'This is a test blog post. Share your knowledge, tips, and fitness insights with the community!',
  true
);
```

## Features

### Blog Post Structure
- **Title**: Main heading (required)
- **Subtitle**: Optional subheading
- **Cover Image**: Optional image URL
- **Body**: Main content (required, supports markdown-style text)
- **Author**: Automatically set to logged-in admin
- **Published**: Draft/Published toggle
- **Dates**: Created and updated timestamps

### Access Control
- ✅ **All Users**: Can view published posts
- ✅ **Admins Only**: Can create, edit, delete, and view drafts
- ✅ **RLS**: Row-level security enforced

## Usage

### For Admins
1. Navigate to Blog page (newspaper icon in profile dropdown)
2. Click "New Post" button
3. Fill in title, subtitle, body, optional image
4. Toggle "Published" to make visible
5. Click "Create Post"

### For Users
- View all published blog posts in chronological order (newest first)
- Click on a post to read full content
- See author name and publish date

## Optional: Storage for Images

If you want to upload images directly (instead of using URLs), set up a `blog-images` bucket:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true);

-- Allow authenticated users to read
CREATE POLICY "Public can view blog images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- Allow admins to upload
CREATE POLICY "Admins can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' AND
  EXISTS (
    SELECT 1 FROM public.admin_user
    WHERE user_id = auth.uid()
  )
);
```

Then update the blog post form to include image upload functionality.

