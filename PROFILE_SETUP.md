# Profile Settings Setup

This guide explains how to set up the profile features including avatar uploads.

## Database Migration

1. Run the profile migration to add avatar support:
   ```bash
   # In Supabase SQL Editor, run:
   supabase/migrations/add_avatar_url_to_profile.sql
   ```

2. Or manually add the columns to your existing `profile` table:
   ```sql
   ALTER TABLE public.profile
   ADD COLUMN IF NOT EXISTS avatar_url TEXT,
   ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
   ```

## Supabase Storage Setup

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New Bucket**
4. Configure the bucket:
   - **Name:** `avatars`
   - **Public bucket:** Toggle ON (to allow public read access)
   - Click **Create bucket**

5. **IMPORTANT: Set up Storage Policies** (Required for uploads to work)
   
   You MUST run the SQL script or manually create policies. Choose one method:

   ### Method A: Run SQL Script (Easiest)
   1. Go to Supabase Dashboard → **SQL Editor**
   2. Copy and paste the entire contents of `supabase/storage-setup.sql`
   3. Click **Run**
   4. Verify you see "Success" messages

   ### Method B: Manual Setup via Dashboard
   1. Click on the `avatars` bucket
   2. Go to **Policies** tab
   3. Click **New Policy** and create these 4 policies:

   **Policy 1: Authenticated users can upload avatars**
   - Operation: INSERT
   - Policy name: `Authenticated users can upload avatars`
   - Target roles: `authenticated`
   - Policy definition (WITH CHECK):
     ```sql
     bucket_id = 'avatars'
     ```

   **Policy 2: Avatars are publicly accessible**
   - Operation: SELECT
   - Policy name: `Avatars are publicly accessible`
   - Target roles: `public`
   - Policy definition (USING):
     ```sql
     bucket_id = 'avatars'
     ```

   **Policy 3: Users can update own avatar**
   - Operation: UPDATE
   - Policy name: `Users can update own avatar`
   - Target roles: `authenticated`
   - Policy definition USING:
     ```sql
     bucket_id = 'avatars'
     ```
   - Policy definition WITH CHECK:
     ```sql
     bucket_id = 'avatars'
     ```

   **Policy 4: Users can delete own avatar**
   - Operation: DELETE
   - Policy name: `Users can delete own avatar`
   - Target roles: `authenticated`
   - Policy definition (USING):
     ```sql
     bucket_id = 'avatars'
     ```

### Quick Verification

After setting up policies, verify they exist:
1. Go to Supabase Dashboard → Storage → `avatars` bucket → Policies tab
2. You should see 4 policies listed:
   - ✅ Authenticated users can upload avatars (INSERT)
   - ✅ Avatars are publicly accessible (SELECT)
   - ✅ Users can update own avatar (UPDATE)
   - ✅ Users can delete own avatar (DELETE)

## Features

### Profile Picture Upload
- Users can upload their profile picture (JPG, PNG, GIF)
- Maximum file size: 2MB
- Images are stored in Supabase Storage
- Automatic validation and error handling

### Nickname
- Users can set a display name/nickname
- Saved to the `profile` table
- Used throughout the app for personalization

### Contact & Support
- Email support link
- GitHub issues link (update with your repo URL)
- App version information

## Customization

### Update Contact Details

In `components/settings/settings-form.tsx`, update the contact links:

```tsx
<a href="mailto:YOUR_EMAIL@example.com">
  {/* Email Support */}
</a>

<a href="https://github.com/YOUR_USERNAME/YOUR_REPO/issues">
  {/* Report an Issue */}
</a>
```

## Testing

1. Navigate to `/app/settings`
2. Try uploading a profile picture
3. Update your nickname
4. Verify the avatar appears in the profile section
5. Test the contact links

## Troubleshooting

### Avatar Upload Fails with RLS Policy Violation ⚠️ MOST COMMON
**Symptom:** `StorageApiError: new row violates row-level security policy`

**This is the most common error and means storage policies are missing or incorrect.**

**Solution:**
1. Go to Supabase Dashboard → **SQL Editor**
2. Copy the entire contents of `supabase/storage-setup.sql`
3. Paste and click **Run**
4. You should see success messages for creating 4 policies
5. Refresh your app and try uploading again

**Verify Policies Exist:**
```sql
-- Run this to check if policies exist:
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%avatar%';

-- You should see 4 rows returned
```

**If policies already exist but upload still fails:**
```sql
-- Delete old policies and recreate
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- Then run storage-setup.sql again
```

### Avatar Upload Fails with 400 Bad Request
**Symptom:** `POST .../storage/v1/object/avatars/... 400 (Bad Request)`

**Possible Causes:**
1. **Bucket doesn't exist**
   - Go to Supabase Dashboard → Storage
   - Check if `avatars` bucket exists
   - If not, create it as described above

2. **Bucket is not public**
   - Click on the `avatars` bucket
   - Check "Public bucket" toggle is ON
   - If off, go to bucket settings and enable it

**Quick Fix:**
```sql
-- Run this in Supabase SQL Editor to verify bucket exists:
SELECT * FROM storage.buckets WHERE name = 'avatars';

-- If it doesn't exist, create it:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);
```

### Avatar Upload Fails with 403 Forbidden
- Check that you're signed in (authenticated)
- Verify storage policies allow INSERT for authenticated users
- Try logging out and back in
- Check browser console for authentication errors

### Avatar Shows Broken Image
- Verify the URL in the database is correct
- Check the file was actually uploaded to storage
- Ensure the bucket is set to **public**
- Try accessing the URL directly in a new browser tab

### Profile Not Loading
- Check that the `profile` table has the `avatar_url` column
- Verify RLS policies allow authenticated users to read their profile
- Check browser console for errors
- Run migration: `supabase/migrations/add_avatar_url_to_profile.sql`

### Display Name Not Saving
- Verify the `display_name` column exists in the `profile` table
- Check RLS policies allow updates to the profile table
- Ensure the user is authenticated
- Check for console errors in browser DevTools

