# 🚀 Admin Announcements - Quickstart Guide

## 1️⃣ Database Setup (5 minutes)

### Option A: Run Migration File
```bash
# Go to Supabase Dashboard → SQL Editor
# Copy and paste the contents of: supabase/migrations/add_announcements.sql
# Click "Run"
```

### Option B: Quick SQL Commands
```sql
-- 1. Create announcement table
create table public.announcement (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  created_at timestamptz default now()
);

-- 2. Enable RLS
alter table public.announcement enable row level security;

-- 3. Add policies
create policy "All authenticated users can view announcements"
  on public.announcement for select
  to authenticated
  using (true);

create policy "Only admins can insert announcements"
  on public.announcement for insert
  to authenticated
  with check (
    exists (
      select 1 from public.admin_user
      where admin_user.user_id = auth.uid()
    )
  );

create policy "Only admins can delete announcements"
  on public.announcement for delete
  to authenticated
  using (
    exists (
      select 1 from public.admin_user
      where admin_user.user_id = auth.uid()
    )
  );

-- 4. Create index
create index idx_announcement_created_at 
on public.announcement(created_at desc);
```

## 2️⃣ Make Yourself Admin (1 minute)

```sql
-- Find your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Add yourself as admin (replace 'your-user-id' with actual ID)
INSERT INTO public.admin_user (user_id)
VALUES ('your-user-id-here')
ON CONFLICT (user_id) DO NOTHING;
```

## 3️⃣ Test It Out! ✅

### As Admin:
1. Navigate to **Settings**
2. See "Admin Announcements" card at the top
3. Type a test message
4. Click "Post Announcement"
5. ✅ It appears in the list!

### As User:
1. Navigate to **Log** page
2. ✅ See "Announcements" card with your message
3. ✅ Your profile picture and nickname appear
4. ✅ Relative timestamp (e.g., "5 minutes ago")

## 🎨 What You Get

### Admin Features (Settings Page)
- 📝 Post announcements with textarea
- 📋 View all announcements
- 🗑️ Delete any announcement
- 📊 Scroll through history

### User Features (Log Page)
- 👀 View announcements (read-only)
- 🖼️ See admin profile picture
- 👤 See admin nickname
- ⏰ Relative timestamps
- 🎨 Beautiful blue-themed cards

## 🔒 Security

✅ Non-admins **cannot**:
- See admin panel
- Post announcements
- Delete announcements

✅ All users **can**:
- Read announcements
- See admin profile info

## 🎯 Usage Tips

### For Admins:
- Keep messages concise
- Use line breaks for readability
- Delete old/outdated announcements
- Use emojis for visual appeal 🎉

### Example Announcements:
```
🚀 New Feature: We just added workout templates! Check them out in the Log page.

⚠️ Maintenance: App will be briefly unavailable tomorrow at 3 AM EST for updates.

🎉 Congrats to everyone who hit 100+ workouts this month! Keep crushing it! 💪
```

## ❓ Troubleshooting

### "Admin Announcements" doesn't show in Settings
→ Verify you're in the `admin_user` table:
```sql
SELECT * FROM public.admin_user WHERE user_id = 'your-user-id';
```

### Can't post announcements (403 error)
→ Add yourself as admin (see Step 2 above)

### Announcements don't show on Log page
→ Post your first announcement as admin
→ Card auto-hides when no announcements exist

### Profile picture not showing
→ Upload avatar in Settings → Profile

## 🚀 That's It!

You now have a fully functional admin announcements system! 🎉

For more details, see `ANNOUNCEMENTS_SETUP.md`


