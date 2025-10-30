# 1RM Tracker Feature

## Overview
The 1RM (One Rep Max) Tracker is a comprehensive feature that automatically detects and logs true 1RM lifts, allows users to set goals, and tracks progress over time.

## Features

### 1. Automatic 1RM Detection
- **Trigger**: When a user logs a set with 1 rep that is NOT marked as a warmup
- **Action**: Automatically creates a 1RM lift record in the database
- **Weight Units**: Supports both kg and lb with automatic conversion for goal tracking

### 2. Manual 1RM Logging
- Users can manually add 1RM lifts for past achievements
- Includes optional notes for context (e.g., "Competition lift", "New PR")
- Date selection for accurate historical tracking

### 3. Goal Setting
- Set target 1RM weights for any exercise
- Optional target dates for accountability
- Quick timeframe presets (1 month, 3 months, 6 months)
- Visual progress tracking with percentage indicators

### 4. Goal Achievement Detection
- Automatically marks goals as achieved when a 1RM meets or exceeds the target
- Badge indicators for achieved goals
- Celebrates success with visual feedback

### 5. Progress Tracking
- Historical view of all 1RM lifts for an exercise
- Current 1RM display with date
- Goal progress percentage
- Chronological lift history with delete capability

## User Interface

### Main Components

1. **Exercise Selector**
   - Dropdown to choose which exercise to track
   - Shows exercise name and body part

2. **Current Stats Cards**
   - **Current 1RM**: Blue gradient card showing latest lift and date
   - **Goal Progress**: Purple gradient card showing progress percentage and target

3. **Action Buttons**
   - "Add 1RM Lift": Manually log a 1RM
   - "Set Goal" / "Update Goal": Create or modify goal

4. **Lift History**
   - List of all recorded 1RMs for the selected exercise
   - Shows weight, date, notes, and goal achievement badges
   - Delete option for each lift

5. **Current Goal Card**
   - Purple-themed card displaying active goal
   - Target weight, target date, and achievement status
   - Remove goal option

## Database Schema

### `one_rm_lift` Table
- `id`: UUID primary key
- `user_id`: Reference to profile
- `exercise_id`: Reference to exercise
- `weight`: Numeric weight value
- `weight_unit`: 'kg' or 'lb'
- `set_entry_id`: Optional reference to the set that triggered this (nullable)
- `logged_at`: Timestamp of the lift
- `notes`: Optional text notes
- `created_at`: Record creation time

### `one_rm_goal` Table
- `id`: UUID primary key
- `user_id`: Reference to profile
- `exercise_id`: Reference to exercise (unique per user)
- `target_weight`: Numeric goal weight
- `weight_unit`: 'kg' or 'lb'
- `target_date`: Optional target date
- `achieved`: Boolean flag
- `achieved_at`: Timestamp when goal was achieved
- `created_at`: Record creation time
- `updated_at`: Last update time

### `one_rm_progress` View
- Joins lifts, exercises, and goals
- Calculates goal progress percentage with unit conversion
- Provides a unified view for UI consumption

## API Endpoints

### Lifts
- `GET /api/one-rm/lifts?exercise_id={id}` - Fetch lifts (optionally filtered)
- `POST /api/one-rm/lifts` - Manually add a lift
- `DELETE /api/one-rm/lifts/{id}` - Remove a lift

### Goals
- `GET /api/one-rm/goals?exercise_id={id}` - Fetch goals (optionally filtered)
- `POST /api/one-rm/goals` - Create or update a goal (upsert)
- `DELETE /api/one-rm/goals/{id}` - Remove a goal

## How It Works

### Automatic Detection Flow
1. User completes a workout and logs a set with 1 rep (not warmup)
2. Database trigger `trigger_auto_log_one_rm` fires on `set_entry` INSERT
3. Function `auto_log_one_rm()` extracts user_id from workout_session
4. Inserts/updates record in `one_rm_lift` table
5. Checks if this lift achieves any active goal
6. If goal is achieved, updates `one_rm_goal.achieved = true`

### Manual Logging Flow
1. User selects exercise in 1RM Tracker
2. Clicks "Add 1RM Lift" button
3. Fills in weight, unit, date, and optional notes
4. Submits form → API creates record
5. UI refreshes to show new lift in history

### Goal Setting Flow
1. User selects exercise in 1RM Tracker
2. Clicks "Set Goal" button
3. Enters target weight, unit, and optional target date
4. Submits form → API upserts goal record
5. UI shows goal card and progress percentage

## Deployment Steps

### 1. Apply Database Migration
Run the migration file to create tables, triggers, and views:

```bash
# If using local Supabase
supabase db push

# If using remote Supabase Dashboard
# Go to SQL Editor and run the contents of:
supabase/migrations/20241030130000_create_one_rm_tracker.sql
```

### 2. Update Database Types (Optional)
If you have TypeScript type generation set up:

```bash
supabase gen types typescript --local > lib/supabase/database.types.ts
```

### 3. Verify Files Created
- `lib/types/one-rm.ts` - TypeScript types
- `app/api/one-rm/lifts/route.ts` - Lifts API
- `app/api/one-rm/lifts/[id]/route.ts` - Delete lift API
- `app/api/one-rm/goals/route.ts` - Goals API
- `app/api/one-rm/goals/[id]/route.ts` - Delete goal API
- `components/progress/one-rm-tracker.tsx` - Main UI component
- `components/progress/set-one-rm-goal-dialog.tsx` - Goal dialog
- `components/progress/add-one-rm-lift-dialog.tsx` - Add lift dialog

### 4. Test the Feature
1. Go to Progress page
2. Log a workout with a 1-rep set (not warmup)
3. Check that it appears in the 1RM Tracker
4. Set a goal and verify progress calculation
5. Manually add a lift and verify it appears in history

## User Benefits

1. **Automated Tracking**: No manual entry required for 1RMs logged during workouts
2. **Goal Accountability**: Set targets with optional deadlines
3. **Progress Visualization**: See improvement over time with percentage indicators
4. **Historical Context**: Keep notes on special lifts (competitions, PRs, etc.)
5. **Motivation**: Visual feedback and achievement badges celebrate success

## Future Enhancements (Optional)

- Charts showing 1RM progression over time
- Comparison with estimated 1RM from higher-rep sets
- Notifications when approaching or achieving goals
- Leaderboard for 1RM achievements
- Export 1RM history to CSV
- Integration with powerlifting total calculator (Squat + Bench + Deadlift)

## Security & Privacy

- All data is user-scoped via RLS policies
- Users can only view/modify their own lifts and goals
- Automatic detection trigger runs with `security definer` to access workout session data
- No public exposure of personal 1RM data

## Mobile Optimization

- Responsive card layouts
- Touch-friendly buttons and inputs
- Mobile-first design with gradient cards
- Clear visual hierarchy for easy scanning
- Optimized for thumb-friendly interaction

---

**Status**: ✅ Complete and ready for testing
**Last Updated**: October 30, 2024

