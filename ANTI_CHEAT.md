# Anti-Cheat Measures for Gamification

This document explains the anti-cheat measures implemented to prevent gaming the XP/gamification system.

## Measures Implemented

### 1. **Workout Cooldown (30 minutes)**
- Users cannot earn XP from workouts completed within 30 minutes of each other
- Prevents spamming multiple fake workouts in quick succession
- The workout is still saved, but no XP is awarded
- User receives notification: "Workout saved! (Cooldown active or daily XP limit reached)"

### 2. **Minimum Workout Duration (5 minutes)**
- Workouts shorter than 5 minutes do not award XP
- Prevents users from quickly starting/ending workouts for XP
- Reasonable threshold - even quick workouts take at least 5 minutes
- Duration calculated from workout start time to finish time

### 3. **Daily XP Cap (500 XP/day)**
- Maximum 500 XP can be earned per day from all sources
- Resets at midnight (user's local timezone via last_workout_date comparison)
- Prevents marathon grinding sessions
- Excess XP is not awarded (e.g., if you have 490/500 and try to earn 20 XP, you only get 10)
- User is notified when cap is reached

### 4. **Existing Measures**
These were already in place:
- Exercise blocks need ≥2 sets to award XP (prevents single-set spam)
- Warmup sets don't count toward XP
- PR XP is only awarded once per exercise per session

## XP Award Breakdown

### Per Workout:
- **Exercise Block with ≥2 sets**: 5 XP
- **Each work set (non-warmup)**: 1 XP
- **New PR**: 10 XP

### Example:
A typical 3-exercise workout with 3-4 sets each would earn:
- 3 exercises × 5 XP = 15 XP
- 10 work sets × 1 XP = 10 XP
- **Total: 25 XP** (well under the daily cap)

Even 5 workouts per day would only be ~125 XP, leaving plenty of room for legitimate training.

## Database Changes

### New Field Added:
```sql
ALTER TABLE public.user_gamification 
ADD COLUMN daily_xp_earned INT NOT NULL DEFAULT 0;
```

## Migration Instructions

### For New Databases:
Run the complete `supabase/schema.sql` - it includes the new field.

### For Existing Databases:
Run the migration:
```sql
-- From Supabase SQL Editor
\i supabase/migrations/add_daily_xp_tracking.sql
```

Or manually:
```sql
ALTER TABLE public.user_gamification 
ADD COLUMN IF NOT EXISTS daily_xp_earned INT NOT NULL DEFAULT 0;
```

## Legitimate Use Cases

These measures should NOT impact legitimate users:
- ✅ Training multiple times per day (35+ min between sessions)
- ✅ Long workout sessions (no time limit)
- ✅ High-volume training programs
- ✅ Multiple exercises and sets

## Future Considerations

Additional measures that could be added:
1. **Exercise variety check** - Flag users who only log the same 1-2 exercises
2. **Unrealistic PR detection** - Flag PRs that increase by >50% in a single session
3. **Volume anomaly detection** - Flag sudden spikes in total volume
4. **Session pattern analysis** - Detect suspicious timing patterns

## Code Locations

- **XP Award Logic**: `lib/hooks/use-gamification.ts` → `useAddXP()`
- **Workout Completion**: `components/workout/workout-logger.tsx` → `handleEndWorkout()`
- **Schema**: `supabase/schema.sql`
- **Migration**: `supabase/migrations/add_daily_xp_tracking.sql`


