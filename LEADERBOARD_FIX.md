# Leaderboard Real-Time Update Fix

## Problem

The leaderboards were showing empty results even after completing workouts because:

1. **Leaderboards query from `weekly_xp` table** - This table stores pre-aggregated weekly stats for fast queries
2. **`weekly_xp` was only updated by a cron job** - The `/api/cron/aggregate-weekly-xp` endpoint was designed to run daily
3. **Cron job never runs in development** - During local development, this job isn't triggered automatically
4. **No real-time updates** - When a workout was completed, it was saved to `workout_session` and `set_entry` tables, but `weekly_xp` was never updated

## Solution

Implemented **real-time `weekly_xp` updates** that happen immediately when:
- A workout is completed
- A workout is deleted

### Changes Made

#### 1. New Utility Function (`lib/utils/weekly-xp.ts`)

Created a reusable function to update `weekly_xp` for a user:

```typescript
export async function updateWeeklyXp(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string
): Promise<void>
```

This function:
- Calculates the current ISO week (matching the leaderboard calculation)
- Fetches all workout sessions for the user this week
- Calculates total volume from all sets
- Calculates total XP (100 base per workout + 1 XP per kg of volume)
- Counts PRs achieved this week
- Gets the user's gym membership if applicable
- Upserts the `weekly_xp` record

#### 2. Updated Workout Save Hook (`lib/hooks/use-workouts.ts`)

**In `useSaveWorkout`:**
- Added import: `import { updateWeeklyXp } from '../utils/weekly-xp'`
- After workout is saved successfully, calls: `await updateWeeklyXp(supabase, userId, session.id)`

**In `useDeleteWorkoutSession`:**
- Fetches `user_id` before deleting the session
- After deletion, calls: `await updateWeeklyXp(supabase, session.user_id, sessionId)`
- This recalculates the week's stats without the deleted workout

### Benefits

✅ **Instant leaderboard updates** - No waiting for cron job
✅ **Works in development** - No need to manually trigger cron jobs
✅ **Works in production** - Provides immediate feedback to users
✅ **Keeps cron job** - The daily cron job still runs as a backup/cleanup mechanism
✅ **Handles deletions** - Leaderboards stay accurate when workouts are removed

### XP Calculation

The XP calculation matches the cron job logic:
- **Base XP**: 100 per workout
- **Volume XP**: 1 XP per kg of total volume (weight × reps)
- **Example**: A workout with 500kg total volume = 100 + 500 = 600 XP

### ISO Week Calculation

The `getIsoWeek()` function uses the same formula as the leaderboard API to ensure consistency:

```typescript
const week = Math.ceil(
  ((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 
  new Date(year, 0, 1).getDay() + 1) / 7
)
return year * 100 + week
```

This creates week numbers like `202543` (year 2025, week 43).

## Testing

To verify the fix works:

1. **Complete a workout** on a test account
2. **Immediately check the leaderboard** - Your stats should appear
3. **Complete a workout on a friend's account**
4. **Check friends leaderboard** - Both accounts should appear with their XP, workouts, and volume
5. **Delete a workout** - Leaderboard should update to reflect the deletion

## Friend Leaderboard Requirements

For the friends leaderboard to show data:
- Users must have accepted friend requests (bidirectional `friend` table entries)
- Both users must have completed at least one workout this week
- The leaderboard API filters by `iso_week` matching the current week

## Notes

- The `updateWeeklyXp` function is non-blocking - errors are logged but don't prevent workout saves
- The function recalculates ALL stats for the week, ensuring accuracy even after edits/deletions
- The cron job (`/api/cron/aggregate-weekly-xp`) can still run daily as a backup mechanism

