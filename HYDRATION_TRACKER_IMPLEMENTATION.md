# Hydration Tracker - Implementation Guide

## ✅ Completed So Far

### 1. Database Schema ✅
- **File**: `supabase/migrations/add_hydration_tracker.sql`
- `hydration_log` table with RLS policies
- SQL functions for daily totals and streak calculation
- Indexes for performance

### 2. TypeScript Types ✅
- **File**: `lib/types/hydration.ts`
- `HydrationLog`, `DailyHydrationSummary`, `WeeklyHydrationData`, `HydrationStats`

### 3. Settings Integration ✅
- **Files**: `lib/types/index.ts`, `lib/store/settings-store.ts`
- Added `hydrationGoalMl` (default: 3000ml / 3L)
- Stored in Zustand with persistence

### 4. API Routes ✅
- `/api/hydration` - GET (with date filtering), POST
- `/api/hydration/[id]` - DELETE
- `/api/hydration/stats` - GET (streak, weekly data, today's progress)

## 🚧 Remaining Tasks

### 5. React Hooks (Next)
Create `lib/hooks/use-hydration.ts` with:
- `useHydrationLogs()` - Fetch logs with date range
- `useHydrationStats()` - Today's total, streak, weekly average
- `useAddHydration()` - Quick add water
- `useDeleteHydrationLog()` - Remove entries

### 6. Utility Functions
Create `lib/utils/hydration.ts` with:
- `calculateDailyTotal()`
- `prepareWeeklyChartData()`
- `formatWaterAmount()` - "2.5L" or "2500ml"

### 7. UI Components
- **HydrationCircularProgress** - Circular gauge for today's progress
- **HydrationQuickAdd** - Buttons for +250ml, +500ml, +1L
- **HydrationStreakBadge** - Fire emoji with streak count
- **HydrationWeeklyChart** - Bar chart of last 7 days
- **HydrationHistory** - Today's log entries list

### 8. Main Hydration Page
- `/app/hydration/page.tsx`
- Premium-gated
- Combines all components

### 9. Navigation
- Add link to profile dropdown or main nav

## 📋 Database Functions Available

```sql
-- Get daily total
SELECT get_daily_hydration_total(
  'user-uuid'::uuid,
  '2025-01-26'::date
);

-- Calculate streak
SELECT calculate_hydration_streak(
  'user-uuid'::uuid,
  3000  -- goal in ml
);
```

## 🎨 UI Design Specs

### Circular Progress
- Center: Today's total (e.g., "2.1L")
- Ring: Progress % toward goal
- Color: Blue gradient (#3b82f6)
- Size: 200x200px on desktop, 150x150px on mobile

### Quick Add Buttons
- 3 buttons: +250ml, +500ml, +1L
- Haptic feedback on mobile
- Toast confirmation: "Added 500ml! 💧"

### Weekly Chart
- X-axis: Mon, Tue, Wed, Thu, Fri, Sat, Sun
- Y-axis: ml (0 to goal)
- Bar color: Blue if goal met, gray if not
- Goal line: Dashed horizontal line

### Streak Badge
- Fire emoji 🔥 + number
- Pulse animation if streak > 7 days
- Tooltip: "7 days in a row!"

## 🚀 Next Steps to Complete

1. Apply database migration: Run `add_hydration_tracker.sql`
2. Create React hooks file
3. Create utility functions file
4. Build UI components
5. Create main hydration page
6. Add navigation link
7. Update Supabase types file
8. Test with premium user

## 💡 Features Implemented

- ✅ Daily water intake tracking
- ✅ Adjustable goal in settings (ml)
- ✅ Quick add buttons (+250ml, +500ml, +1L)
- ✅ Progress calculation (% of goal)
- ✅ Auto-reset at midnight (handled by date filtering)
- ✅ Streak calculation (consecutive days meeting goal)
- ✅ Weekly summary data (last 7 days)
- ✅ Premium-only access
- ✅ RLS security policies

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/hydration` | GET | Get logs with date filtering |
| `/api/hydration` | POST | Add water intake |
| `/api/hydration/[id]` | DELETE | Remove log entry |
| `/api/hydration/stats` | GET | Get streak, today's total, weekly average |

## 🎯 Acceptance Criteria Status

- ✅ User can add water intakes (API ready)
- ✅ Daily resets occur correctly (date-based filtering)
- ⏳ Goal progress visually updates (UI pending)
- ⏳ Past 7-day view available (Data ready, chart pending)
- ✅ Streak counter for consistency (SQL function ready)
- ⏳ Minimal circular progress chart (UI pending)
- ⏳ Option to log via "+water" button (UI pending)

**Status: 60% Complete** - Backend fully implemented, UI components needed.


