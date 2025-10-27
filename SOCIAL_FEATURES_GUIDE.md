# Social Features Implementation Guide

## Overview

Plate Progress now includes comprehensive social features allowing users to connect with friends, join gyms, compete on leaderboards, and track progress together.

## Features

### 1. Friends System
- **Send/Accept/Reject Friend Requests**
  - Users can send friend requests via username search
  - Privacy controls for who can send requests (anyone, friends-of-friends, nobody)
  - Incoming/outgoing request management
  
- **Friends List**
  - View all friends with their stats (weekly XP, streak, top PR)
  - Remove friends
  - Quick compare button for detailed stat comparison

### 2. Friend Comparison
- **Side-by-Side Stats**
  - Compare XP, workouts, volume, PRs
  - Time ranges: 7, 30, or 90 days
  - All-time stats (total workouts, streaks, total PRs)
  
- **Timeline Charts**
  - Visual XP trend comparison
  - Volume trend comparison over time

### 3. Leaderboards
Three leaderboard types:
- **Friends**: Compete with your friends
- **Gym**: Compete with gym members (opt-in)
- **Global**: Public leaderboard (opt-in)

Time ranges:
- This Week
- This Month
- All Time

Features:
- Pagination (50 entries per page)
- User rank pinned at bottom if not on current page
- Flags for new accounts and suspicious activity
- Cached for performance (5-minute TTL)

### 4. Gym System
- **Create/Join Gyms**
  - Gym codes (3-20 uppercase alphanumeric)
  - Optional descriptions
  - Owner controls (approval requirements, verified status)
  
- **Gym Leaderboards**
  - Opt-in/opt-out per member
  - Member count display
  - Gym-specific rankings

### 5. Privacy Controls
- **Friend Requests**: Anyone, Friends-of-Friends, or Nobody
- **Global Leaderboard**: Opt-in/opt-out
- **Gym Leaderboard**: Opt-in/opt-out (default: opt-in)
- **Public Profile**: Show/hide profile to others

### 6. Anti-Cheat System
Multi-layered protection:

**Validation Checks**:
- Max XP per hour (2000)
- Max volume per session (50,000 kg)
- Max weight per set (500 kg)
- Minimum set duration (2 seconds)
- Max sets per session (500)
- Anomaly detection (>5x user median)
- New account throttling (<7 days)

**Severity Levels**:
- **Low**: Warning, allowed to save
- **Medium**: Flagged for review, allowed to save
- **High**: Rejected, must contact support

**Admin Moderation**:
- Review flagged workouts
- Clear false positives
- Confirm cheating
- Add review notes
- User history inspection

### 7. Weekly XP Aggregator
Background job that runs daily (midnight UTC):
- Aggregates workout data into `weekly_xp` table
- Calculates XP, workouts, volume, PR counts
- Associates with gym memberships
- Powers fast leaderboard queries

## Database Schema

### Core Tables
- `gym`: Gym metadata
- `gym_member`: User gym memberships
- `friend_request`: Friend request queue
- `friend`: Bidirectional friendships
- `weekly_xp`: Pre-aggregated leaderboard data
- `anti_cheat_flag`: Suspicious activity flags

### Privacy Columns (on `profile`)
- `friend_request_privacy`
- `show_on_global_leaderboard`
- `show_on_gym_leaderboard`
- `friends_list_public`
- `account_verified_at` (for new user throttling)

## API Endpoints

### Friends
- `POST /api/friends/request` - Send friend request
- `POST /api/friends/accept` - Accept request
- `POST /api/friends/reject` - Reject request
- `GET /api/friends/list` - Get friends
- `DELETE /api/friends/list?friend_id=X` - Remove friend
- `GET /api/users/search?q=username` - Search users

### Gym
- `POST /api/gym/create` - Create gym
- `POST /api/gym/join` - Join gym
- `POST /api/gym/leave` - Leave gym
- `GET /api/gym/my-gym` - Get user's gym
- `GET /api/gym/[code]` - Get gym details
- `GET /api/gym/[code]/members` - Get gym members

### Leaderboard
- `GET /api/leaderboard?type=friends&range=week&page=1` - Get leaderboard

### Compare
- `GET /api/compare/[friend_id]?days=7` - Compare with friend

### Privacy
- `GET /api/settings/privacy` - Get privacy settings
- `PATCH /api/settings/privacy` - Update privacy settings

### Admin
- `GET /api/admin/anti-cheat-flags?status=pending` - Get flags
- `PATCH /api/admin/anti-cheat-flags` - Review flag

### Cron
- `POST /api/cron/aggregate-weekly-xp` - Aggregate weekly XP (daily)

## Setup Instructions

### 1. Database Migration
Run the social features migration:
```bash
# If using Supabase CLI
supabase migration up

# Or apply manually via Supabase dashboard
# supabase/migrations/add_social_features.sql
```

### 2. Environment Variables
Add to `.env.local`:
```
CRON_SECRET=your_secret_key_here
```

### 3. Vercel Cron Setup
The `vercel.json` file configures daily aggregation at midnight UTC.

Alternatively, use an external cron service to call:
```
POST https://your-domain.com/api/cron/aggregate-weekly-xp
Authorization: Bearer YOUR_CRON_SECRET
```

### 4. Admin Users
To enable admin moderation for a user:
```sql
-- In your Supabase SQL editor
insert into admin_user (user_id) values ('USER_ID_HERE');
```

## Usage

### For Users
1. Navigate to **Social** tab in bottom navigation
2. Send friend requests via username search
3. Accept/reject incoming requests
4. View friends list and compare stats
5. Join/create a gym for gym-specific leaderboards
6. Configure privacy settings
7. View leaderboards (Friends/Gym/Global)

### For Gym Owners
1. Create gym with unique code
2. Share code with members
3. Optionally require approval for new members
4. Members auto-appear on gym leaderboard (if opted-in)

### For Admins
1. Access admin panel (automatically shown if admin)
2. Review pending anti-cheat flags
3. Clear false positives or confirm violations
4. Add review notes for record-keeping

## Anti-Cheat Philosophy

The system is designed to:
1. **Trust but verify**: Allow normal activity, flag anomalies
2. **Minimize false positives**: Multiple checks before high-severity
3. **Transparency**: Users can see their own flags
4. **Appeal process**: Admin review for flagged users
5. **Privacy-respecting**: No invasive tracking

## Performance Considerations

- Leaderboards are cached (5-minute TTL)
- Weekly XP pre-aggregation for fast queries
- Pagination prevents large data transfers
- Background jobs handle expensive calculations
- RLS policies ensure data security

## Future Enhancements

Potential additions:
- Push notifications for friend requests
- Activity feed (friend PRs, workout streaks)
- Challenges (who can log most workouts this week)
- Team competitions
- Verified gym badges
- User profiles with bio/stats
- Friend workout sharing
- Gym owner analytics dashboard

## Troubleshooting

**Leaderboard not updating?**
- Weekly XP aggregator runs daily at midnight UTC
- Manually trigger: `GET /api/cron/aggregate-weekly-xp` (requires admin)

**Friend request failing?**
- Check target user's privacy settings
- Verify no existing request or friendship
- Ensure username is correct

**Workout flagged incorrectly?**
- Contact support or wait for admin review
- High-severity flags block save; medium/low allow save
- Appeal through admin moderation queue

**Gym leaderboard empty?**
- Ensure members have opted in
- Check gym membership status
- Verify weekly XP has been aggregated

## Security Notes

- All endpoints require authentication
- RLS policies on all social tables
- Admin endpoints check `admin_user` table
- Cron endpoints require secret token
- Privacy settings respected across all features
- Rate limiting recommended for production

## Migration Rollback

If needed, social features can be disabled:
```sql
-- Drop tables in reverse order
drop table if exists anti_cheat_flag cascade;
drop table if exists weekly_xp cascade;
drop table if exists friend cascade;
drop table if exists friend_request cascade;
drop table if exists gym_member cascade;
drop table if exists gym cascade;

-- Remove privacy columns
alter table profile
  drop column if exists friend_request_privacy,
  drop column if exists show_on_global_leaderboard,
  drop column if exists show_on_gym_leaderboard,
  drop column if exists friends_list_public,
  drop column if exists account_verified_at;
```

## Support

For issues or questions:
- Check console for error logs
- Inspect network requests in DevTools
- Verify database RLS policies
- Ensure user is authenticated
- Check Supabase logs for backend errors

---

**Enjoy the social features! Compete, connect, and crush your goals together! 🏋️‍♂️💪**

