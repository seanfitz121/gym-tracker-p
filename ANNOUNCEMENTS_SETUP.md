# Admin Announcements Setup Guide

## Overview
The Admin Announcements feature allows admins to post announcements that all users can see. Each announcement displays the admin's nickname, profile picture, timestamp, and message.

## Database Setup

### Step 1: Run the Migration
Execute the SQL migration in your Supabase project:

```bash
# In Supabase Dashboard → SQL Editor, run:
# supabase/migrations/add_announcements.sql
```

This will:
- Create the `announcement` table
- Set up RLS policies (admin insert/delete, all users can read)
- Create indexes for performance

### Step 2: Make Yourself Admin (if not already)

```sql
-- Insert your user ID into admin_user table
INSERT INTO public.admin_user (user_id)
VALUES ('your-user-id-here')
ON CONFLICT (user_id) DO NOTHING;
```

To find your user ID:
```sql
-- Get your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
```

## Features

### Admin Features (Settings Page)
- **Post Announcements**: Textarea + "Post Announcement" button
- **Manage Announcements**: View all previous announcements with delete icons
- **Auto-display**: Admin section only appears in Settings if user is admin

### User Features (Log Page)
- **View Announcements**: Card list showing:
  - Admin profile picture
  - Admin nickname
  - Message content
  - Relative timestamp (e.g., "2h ago")
- **Auto-hide**: Announcements card doesn't show if no announcements exist

## API Routes

### GET /api/announcement
- **Access**: All authenticated users
- **Returns**: List of announcements with admin profile data (newest first)

### POST /api/announcement
- **Access**: Admin only
- **Body**: `{ message: string }`
- **Returns**: Created announcement with profile data

### DELETE /api/announcement/:id
- **Access**: Admin only
- **Returns**: Success confirmation

## UI Components

### AdminAnnouncementsManager
Location: `components/announcements/admin-announcements-manager.tsx`
- Used in: Settings page (admin only)
- Features: Post, view, and delete announcements

### AnnouncementsList
Location: `components/announcements/announcements-list.tsx`
- Used in: Log page (all users)
- Features: View-only announcements with profile info

## Styling
Built with shadcn/ui components:
- `Card` - Container styling
- `Avatar` - Profile pictures
- `Textarea` - Message input
- `Button` - Actions
- `ScrollArea` - Scrollable list
- `Separator` - Visual dividers
- `Badge` - Admin label

## Verification Checklist

### For Admins
- [ ] Navigate to Settings
- [ ] See "Admin Announcements" card at the top
- [ ] Post a test announcement
- [ ] See it appear in the list immediately
- [ ] Delete the test announcement
- [ ] Verify it's removed

### For Users
- [ ] Navigate to Log page
- [ ] See "Announcements" card (if any exist)
- [ ] View admin's profile picture and nickname
- [ ] See relative timestamp (e.g., "5 minutes ago")
- [ ] Verify no edit/delete buttons appear

### Security
- [ ] Non-admin users cannot see admin panel in Settings
- [ ] Non-admin users cannot post announcements (403 error)
- [ ] Non-admin users cannot delete announcements (403 error)
- [ ] All users can read announcements

## Troubleshooting

### "Admin Announcements" not showing in Settings
**Symptom**: Admin section doesn't appear even though user is admin

**Solution**:
1. Verify you're in the admin_user table:
```sql
SELECT * FROM public.admin_user WHERE user_id = 'your-user-id';
```

2. If not there, add yourself:
```sql
INSERT INTO public.admin_user (user_id) VALUES ('your-user-id');
```

### "Forbidden: Admin access required" when posting
**Symptom**: Error 403 when trying to post announcement

**Solution**: Same as above - ensure you're in the `admin_user` table

### Announcements not appearing on Log page
**Symptom**: No announcements card visible

**Solution**:
1. Check if any announcements exist:
```sql
SELECT * FROM public.announcement ORDER BY created_at DESC;
```

2. If empty, post your first announcement as admin
3. The card auto-hides when no announcements exist (this is intentional)

### Profile picture not showing
**Symptom**: Default avatar icon instead of profile picture

**Solution**:
1. Ensure avatar was uploaded in Settings → Profile
2. Check profile table:
```sql
SELECT id, display_name, avatar_url FROM public.profile WHERE id = 'user-id';
```

3. If `avatar_url` is null, upload a profile picture

## Tech Stack
- **Next.js 15**: App Router + API Routes
- **Supabase**: Database + RLS
- **shadcn/ui**: UI components
- **date-fns**: Relative timestamps
- **Sonner**: Toast notifications

## Future Enhancements (Optional)
- Pin important announcements to top
- Announcement categories (info, warning, update)
- Rich text formatting
- Announcement expiration dates
- Announcement reactions (👍 ❤️ 🔥)
- Notification bell for new announcements


