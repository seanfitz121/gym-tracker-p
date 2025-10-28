# Progress Photos Setup Guide

This guide walks you through setting up the Progress Photos feature for your gym tracking app.

## Overview

Progress Photos is a **Premium-only** feature that allows users to:
- Upload transformation photos (before/after)
- Store photos privately with automatic compression
- Compare photos side-by-side with an interactive slider
- Download original quality photos
- Manage storage quota (50 MB default per user)

## Prerequisites

- Supabase project with authentication configured
- Premium user system in place (`profiles.is_premium` column)
- Next.js app with API routes support

## Step 1: Database Migration

Run the database migration to create the necessary tables:

```bash
# Apply the migration
psql -h your-db-host -U postgres -d your-db-name -f supabase/migrations/20241028100000_progress_photos.sql
```

Or use Supabase CLI:

```bash
supabase db push
```

This creates:
- `progress_photo` table - stores photo metadata
- `progress_photo_storage` table - tracks storage usage per user
- RLS policies to ensure privacy
- Indexes for performance

## Step 2: Create Supabase Storage Bucket

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New Bucket**
4. Configure the bucket:
   - **Name**: `progress-photos-private`
   - **Public**: ❌ **Disabled** (must be private!)
   - **File size limit**: 15 MB (or your preference)
   - **Allowed MIME types**: `image/jpeg,image/png,image/webp,image/avif`

5. Click **Create Bucket**

### Using SQL (Alternative)

```sql
-- Create private bucket for progress photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('progress-photos-private', 'progress-photos-private', false);

-- Set up storage policies (owner-only access)
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'progress-photos-private' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'progress-photos-private' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'progress-photos-private' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'progress-photos-private' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## Step 3: Environment Variables

Ensure your environment has the required Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The service role key is needed for server-side storage operations.

## Step 4: Verify Installation

### Test Database Tables

```sql
-- Check tables exist
SELECT * FROM progress_photo LIMIT 1;
SELECT * FROM progress_photo_storage LIMIT 1;

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('progress_photo', 'progress_photo_storage');
```

### Test Storage Bucket

```sql
-- Check bucket exists and is private
SELECT * FROM storage.buckets WHERE id = 'progress-photos-private';
```

## Step 5: Add Navigation Link

Add Progress Photos to your app's navigation:

```tsx
// In your navigation component
{isPremium && (
  <Link href="/app/progress-photos">
    <CameraIcon className="h-4 w-4 mr-2" />
    Progress Photos
  </Link>
)}
```

## Step 6: Test the Feature

1. **Premium User Test**:
   - Log in as a premium user
   - Navigate to `/app/progress-photos`
   - Upload a test photo
   - Verify compression works (check file sizes)
   - Test compare slider with 2+ photos
   - Test download functionality
   - Test delete functionality

2. **Non-Premium Test**:
   - Log in as a free user
   - Navigate to `/app/progress-photos`
   - Verify premium gate shows upgrade CTA

3. **Storage Quota Test**:
   - Upload photos until near quota limit
   - Verify warning appears at 90%
   - Verify upload blocked at 100%
   - Delete photos and verify quota updates

## Architecture Overview

### File Structure

```
app/
  api/
    progress-photos/
      route.ts                    # GET (list), POST handled by upload
      upload/
        route.ts                  # POST (upload with multipart)
      [id]/
        route.ts                  # DELETE
        image/
          route.ts                # GET (signed URL)
        download/
          route.ts                # POST (download URL)

components/
  progress/
    progress-photos-page.tsx      # Main page component
    photo-gallery.tsx             # Grid view with thumbnails
    upload-photo-modal.tsx        # Upload UI with preview
    compare-slider.tsx            # Side-by-side comparison

lib/
  types/
    progress-photo.ts             # TypeScript types
  hooks/
    useProgressPhotos.ts          # React hook for data
  utils/
    image-processing.ts           # Client-side compression
    storage-calculator.ts         # Storage quota utilities
```

### Data Flow

1. **Upload**:
   ```
   User selects image
   → Client compresses to thumb (200px) & medium (1080px)
   → Optional: keeps original
   → Upload to /api/progress-photos/upload
   → Server saves to storage bucket
   → Server creates DB record
   → Updates storage quota
   ```

2. **View**:
   ```
   Client requests photo list
   → Server returns metadata only
   → Client requests signed URLs for thumbs
   → Server generates short-lived URLs (120s)
   → Client displays images
   ```

3. **Compare**:
   ```
   User selects 2 photos
   → Client requests medium variant signed URLs
   → Server verifies ownership & generates URLs
   → Client shows interactive slider
   ```

## Storage Structure

Photos are organized by user ID and photo ID:

```
progress-photos-private/
  {user_id}/
    {photo_id}/
      thumb_{timestamp}.webp      (~50 KB)
      medium_{timestamp}.webp     (~250 KB)
      original_{timestamp}.jpg    (~3 MB, optional)
```

## Security Features

✅ **Private by default**: All photos stored in private bucket
✅ **RLS policies**: Database-level access control
✅ **Owner verification**: All endpoints verify user_id matches auth.uid()
✅ **Signed URLs**: Short-lived (120s) URLs for image access
✅ **Premium gate**: Feature only accessible to premium users
✅ **Storage isolation**: User photos stored in user-specific folders

## Performance Optimizations

- **Client-side compression**: Reduces bandwidth and storage
- **WebP format**: Better compression than JPEG
- **Three variants**: Thumb for gallery, medium for comparison, original for download
- **Lazy loading**: Thumbnails loaded on-demand
- **Signed URL caching**: 120s expiry allows some reuse

## Storage Quota Management

### Default Quotas

- **Free users**: 0 MB (feature disabled)
- **Premium users**: 50 MB

### Quota Enforcement

1. **Upload time**: Server checks quota before accepting files
2. **Visual indicators**: 
   - Green: < 70% used
   - Yellow: 70-90% used
   - Red: > 90% used
3. **Hard limit**: Uploads rejected at 100%

### Adjusting Quotas

```sql
-- Increase quota for specific user
UPDATE progress_photo_storage
SET quota_bytes = 104857600  -- 100 MB
WHERE user_id = 'user-uuid-here';

-- Increase default quota for all new users
ALTER TABLE progress_photo_storage
ALTER COLUMN quota_bytes SET DEFAULT 104857600;
```

## Troubleshooting

### Images not loading

**Problem**: Signed URLs return 404 or expired

**Solution**:
1. Check bucket name is correct (`progress-photos-private`)
2. Verify storage policies allow user access
3. Check file paths in database match storage
4. Ensure signed URL hasn't expired (120s lifetime)

### Upload fails with quota error

**Problem**: User can't upload despite having space

**Solution**:
```sql
-- Recalculate storage for user
-- (This is approximate - adjust as needed)
UPDATE progress_photo_storage
SET total_bytes = (
  SELECT COUNT(*) * 300000  -- Estimate 300KB per photo
  FROM progress_photo
  WHERE user_id = progress_photo_storage.user_id
)
WHERE user_id = 'user-uuid-here';
```

### Premium users can't access feature

**Problem**: Feature shows premium gate even for premium users

**Solution**:
```sql
-- Verify premium status
SELECT id, is_premium FROM profiles WHERE id = 'user-uuid-here';

-- Grant premium if needed
UPDATE profiles SET is_premium = true WHERE id = 'user-uuid-here';
```

### Storage policies not working

**Problem**: Users can see other users' photos

**Solution**:
```sql
-- Verify RLS is enabled
ALTER TABLE progress_photo ENABLE ROW LEVEL SECURITY;

-- Verify policies exist
SELECT * FROM pg_policies WHERE tablename = 'progress_photo';

-- Re-create policies if needed (see Step 2)
```

## Monitoring

### Track storage usage

```sql
-- Total storage used across all users
SELECT 
  SUM(total_bytes) / 1024 / 1024 AS total_mb_used,
  AVG(total_bytes) / 1024 / 1024 AS avg_mb_per_user,
  COUNT(*) AS total_users
FROM progress_photo_storage;

-- Users near quota
SELECT 
  user_id,
  total_bytes / 1024 / 1024 AS mb_used,
  quota_bytes / 1024 / 1024 AS quota_mb,
  (total_bytes::float / quota_bytes * 100)::int AS percent_used
FROM progress_photo_storage
WHERE (total_bytes::float / quota_bytes) > 0.8
ORDER BY percent_used DESC;
```

### Track photo uploads

```sql
-- Recent uploads
SELECT 
  user_id,
  caption,
  taken_at,
  created_at
FROM progress_photo
ORDER BY created_at DESC
LIMIT 20;

-- Upload trends
SELECT 
  DATE(created_at) AS date,
  COUNT(*) AS uploads
FROM progress_photo
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Future Enhancements

Potential improvements:

1. **Advanced compression**: Server-side re-compression for large uploads
2. **Cloud storage**: Move to CDN for better global performance
3. **Bulk operations**: Select and delete multiple photos at once
4. **Photo editing**: Basic crop/rotate before upload
5. **Sharing**: Generate shareable links (opt-in)
6. **AI analysis**: Body composition analysis from photos
7. **Progress timeline**: Animated slideshow of transformation
8. **Exif data**: Extract and display photo metadata
9. **Storage analytics**: Detailed breakdown of usage by variant

## Support

For issues or questions:
- Check console logs in browser and server
- Verify Supabase dashboard for storage errors
- Review RLS policies in SQL editor
- Check API endpoint responses in Network tab

---

**Feature Status**: ✅ Production Ready

Last Updated: October 28, 2024

