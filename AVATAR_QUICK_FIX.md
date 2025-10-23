# 🚨 QUICK FIX: Avatar Upload RLS Error

## Error You're Seeing
```
StorageApiError: new row violates row-level security policy
```

## What This Means
The Supabase storage bucket exists, but it doesn't have the security policies needed to allow authenticated users to upload files.

## Fix It Now (2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar

### Step 2: Run the Policy Setup Script
1. Open the file `supabase/storage-setup.sql` in your code editor
2. Copy **ALL** the contents (Ctrl+A, Ctrl+C)
3. Paste into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify Success
You should see messages like:
- ✅ `INSERT 0 1` (bucket created/verified)
- ✅ `DROP POLICY` (cleaning up old policies)
- ✅ `CREATE POLICY` × 4 (creating new policies)

### Step 4: Test Upload
1. Go back to your app (refresh the page)
2. Navigate to Settings
3. Try uploading an avatar again
4. ✅ It should work now!

---

## Still Not Working?

### Verify Bucket Exists and is Public
Run this in SQL Editor:
```sql
SELECT id, name, public FROM storage.buckets WHERE name = 'avatars';
```

You should see:
| id | name | public |
|----|------|--------|
| avatars | avatars | true |

**If nothing appears:**
```sql
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);
```

### Verify Policies Exist
Run this in SQL Editor:
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;
```

You should see these 4 policies:
1. `Authenticated users can upload avatars` - INSERT
2. `Avatars are publicly accessible` - SELECT
3. `Users can delete own avatar` - DELETE
4. `Users can update own avatar` - UPDATE

**If you see different policy names or fewer than 4:**
- Your old policies are interfering
- Run the cleanup section from `storage-setup.sql` first (the DROP POLICY commands)
- Then run the CREATE POLICY commands

---

## Alternative: Manual Policy Creation

If the SQL script doesn't work, create policies manually:

1. Go to **Storage** → `avatars` bucket → **Policies** tab
2. Click **New Policy** 4 times to create these:

**Policy 1:**
- Template: Custom
- Policy name: `Authenticated users can upload avatars`
- Allowed operation: INSERT
- Target roles: `authenticated`
- WITH CHECK expression: `bucket_id = 'avatars'`

**Policy 2:**
- Template: Custom
- Policy name: `Avatars are publicly accessible`
- Allowed operation: SELECT
- Target roles: `public`
- USING expression: `bucket_id = 'avatars'`

**Policy 3:**
- Template: Custom
- Policy name: `Users can update own avatar`
- Allowed operation: UPDATE
- Target roles: `authenticated`
- USING expression: `bucket_id = 'avatars'`
- WITH CHECK expression: `bucket_id = 'avatars'`

**Policy 4:**
- Template: Custom
- Policy name: `Users can delete own avatar`
- Allowed operation: DELETE
- Target roles: `authenticated`
- USING expression: `bucket_id = 'avatars'`

---

## Why This Happened

Supabase Storage uses Row-Level Security (RLS) policies to control who can upload, read, update, and delete files. By default, **no one** can do anything until you explicitly create policies.

The bucket was created, but without policies, all operations are blocked for security.

---

## Need More Help?

See the full guide: `PROFILE_SETUP.md`


