# Notifications Integration Summary

## ✅ Completed Integrations

### 1. Friend Requests
**Location:** `app/api/friends/request/route.ts`
- ✅ Notification sent when friend request is created
- ✅ Includes sender's display name
- ✅ Only sent to recipient (not sender)

### 2. Community Interactions
**Location:** `app/api/community/reactions/route.ts` and `app/api/community/posts/[id]/comments/route.ts`
- ✅ Notification sent when someone likes a post (not self-like)
- ✅ Notification sent when someone comments on a post (not self-comment)
- ✅ Includes post title and actor's name
- ✅ Links to the post

### 3. Patch Notes
**Location:** `app/api/patch-notes/route.ts` and `app/api/patch-notes/[id]/route.ts`
- ✅ Notification sent when patch note is published (on create or update)
- ✅ Only sent if transitioning from unpublished → published
- ✅ Sent to all users with `patch_notes` preference enabled
- ✅ Includes version and title

### 4. Scheduled Jobs
**Location:** `app/api/cron/workout-reminders/route.ts` and `app/api/cron/gym-expiry/route.ts`
- ✅ Workout reminders: Daily check at 9 AM for users with no workout in 7+ days
- ✅ Gym expiry: Daily check at 9 AM for memberships expiring in 3 days
- ✅ Prevents duplicate notifications (checks last 24 hours)
- ✅ Configured in `vercel.json` for Vercel Cron

## 🔧 Configuration Required

### 1. Vercel Cron Jobs
Add to your Vercel project settings:
- The cron jobs are configured in `vercel.json`
- They run daily at 9 AM UTC
- Protect with `CRON_SECRET` environment variable

### 2. Environment Variables
Add to `.env.local`:
```env
CRON_SECRET=your-secret-key-here
```

### 3. Testing Cron Jobs
You can test the cron jobs manually:
```bash
# Workout reminders
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/workout-reminders

# Gym expiry
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/gym-expiry
```

## 📝 Notes

- All notifications respect user preferences (checked before sending)
- Push notifications only sent if user has push enabled
- In-app notifications always created (even if push disabled)
- Notifications are sent asynchronously (won't block main operations)
- Duplicate prevention: workout reminders and gym expiry check for notifications in last 24 hours

## 🎯 Notification Flow

1. **Event occurs** (friend request, like, comment, etc.)
2. **Check user preferences** - Is this notification type enabled?
3. **Create in-app notification** - Always created in database
4. **Send push notification** - Only if push enabled and subscription exists
5. **User sees notification** - In bell icon dropdown and/or push notification

## 🔄 Scheduled Jobs Flow

1. **Cron job triggers** (daily at 9 AM)
2. **Query users** with relevant preference enabled
3. **Check condition** (no workout in 7 days, gym expiring in 3 days)
4. **Check for recent notification** (prevent duplicates)
5. **Send notification** if conditions met

