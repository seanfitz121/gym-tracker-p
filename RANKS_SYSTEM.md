# Ranks System - Implementation Guide

## Overview

The Ranks system is a cosmetic gamification feature that displays user ranks based on total XP. It includes 10 free ranks from "Noob" to "Bodybuilder", with admin override support.

## Features Implemented

### ✅ Database Schema
- `rank_scale` - Defines rank scales (free/pro)
- `rank_definition` - Individual rank definitions with min XP, colors, icons
- `admin_user` - Admin users who get special "Admin" rank
- Updated `user_gamification` with rank fields (`rank_code`, `rank_scale_code`, `pro_rank_code`)

### ✅ Rank Hierarchy (Free Scale)

| Rank | Name | Min XP | Color | Icon |
|------|------|--------|-------|------|
| 1 | Noob | 0 | slate | dumbbell |
| 2 | Rookie | 100 | sky | sparkles |
| 3 | Novice | 300 | indigo | star |
| 4 | Apprentice | 600 | violet | zap |
| 5 | Intermediate | 1000 | purple | award |
| 6 | Gym Rat | 1600 | amber | flame |
| 7 | Athlete | 2300 | emerald | trophy |
| 8 | Powerlifter | 3200 | cyan | dribbble |
| 9 | Beast | 4300 | rose | skull |
| 10 | Bodybuilder | 5600 | yellow | crown |

### ✅ API & Hooks

**`lib/hooks/use-ranks.ts`**
- `useUserRank(userId)` - Get current rank with admin override
- `useRankProgress(userId)` - Get rank progress with next rank info
- `useRecomputeRank()` - Manually recompute rank
- `useRankDefinitions(scaleCode)` - Get all ranks for a scale

### ✅ Automatic Rank Calculation

Integrated into `useAddXP()` in `lib/hooks/use-gamification.ts`:
- Automatically calculates new rank when XP is awarded
- Checks for admin override
- Returns `rankedUp`, `newRank`, `oldRank` in response
- Updates `user_gamification.rank_code` if rank changes

### ✅ UI Components

**`components/ranks/rank-badge.tsx`**
- Displays rank with icon and colored badge
- Sizes: sm, md, lg
- Shows rank icon and name

**`components/ranks/rank-card.tsx`**
- Full rank card with progress bar
- Shows current rank, next rank, XP to next
- Handles max rank gracefully
- Works with admin ranks

### ✅ UI Integration

1. **Gamification Panel** (`components/gamification/gamification-panel.tsx`)
   - Rank badge displayed next to level in header
   - Color-coded and icon-enhanced

2. **Progress Dashboard** (`components/progress/progress-dashboard.tsx`)
   - Full rank card with progress to next rank
   - Shows XP needed and progress bar

3. **Workout Logger** (`components/workout/workout-logger.tsx`)
   - Rank-up toast notification with confetti
   - Shows: "⭐ Rank Up! You're now {Rank Name}!"
   - Triggers confetti animation on rank up

### ✅ Admin Override

- Users in `admin_user` table get special "Admin" rank
- Admin rank:
  - Code: `ADMIN`
  - Name: `Admin`
  - Color: `red`
  - Icon: `shield`
- Admin ranks don't progress or change based on XP

## Database Setup

### For New Projects

Run the main schema:
```bash
# Schema includes ranks tables and seed data
supabase/schema.sql
```

### For Existing Projects

Run the migration:
```bash
# Add ranks to existing database
supabase/migrations/add_ranks_system.sql
```

### Make Yourself Admin

After signing up, add yourself to admin_user:
```sql
INSERT INTO public.admin_user (user_id)
VALUES ('YOUR_USER_ID_HERE');
```

Get your user ID from Supabase Dashboard → Authentication → Users.

## How It Works

### 1. Rank Calculation Flow

```typescript
User earns XP
  ↓
addXP() hook called
  ↓
Check if user is admin
  ↓ (if not admin)
Get all ranks for scale (free)
  ↓
Find highest rank where min_xp <= totalXP
  ↓
Compare with current rank_code
  ↓ (if different)
Update user_gamification.rank_code
  ↓
Return rankedUp: true, newRank, oldRank
  ↓
Workout logger shows rank-up toast + confetti
```

### 2. Rank Display

- **Badge**: Compact display with icon and name
- **Card**: Full display with progress bar and XP info
- **Colors**: Each rank has unique color theme
- **Icons**: Visual representation of rank level

### 3. Edge Cases Handled

- ✅ New users start at "Noob" (min_xp: 0)
- ✅ Max rank (Bodybuilder) shows "Max Rank Achieved!"
- ✅ Admin users always show "Admin" regardless of XP
- ✅ Rank doesn't decrease if XP somehow goes down
- ✅ Progress bar shows 100% at max rank
- ✅ Handles missing or null rank_code gracefully

## Testing

### Manual Testing Checklist

1. **New User**
   - [ ] Sign up → should get "Noob" rank automatically
   - [ ] Check gamification panel shows "Noob" badge

2. **Rank Up**
   - [ ] Log workout → earn XP → check for rank up at 100 XP
   - [ ] Verify toast shows "⭐ Rank Up! You're now Rookie!"
   - [ ] Verify confetti animation plays

3. **Progress Display**
   - [ ] Go to Progress page
   - [ ] Check rank card shows current rank
   - [ ] Verify progress bar shows correct percentage
   - [ ] Verify "XP to next" is accurate

4. **Admin Override**
   - [ ] Add yourself to admin_user table
   - [ ] Refresh page
   - [ ] Verify "Admin" rank shown (red shield)
   - [ ] Verify rank doesn't change with XP

5. **Max Rank**
   - [ ] Manually set total_xp to 10000 in database
   - [ ] Verify "Bodybuilder" rank shown
   - [ ] Verify "Max Rank Achieved!" message
   - [ ] Verify progress bar shows 100%

### Edge Case Testing

```sql
-- Test rank calculation at boundaries
-- User with 99 XP should be Noob
-- User with 100 XP should be Rookie
-- User with 5600+ XP should be Bodybuilder

-- Test admin override
INSERT INTO admin_user (user_id) VALUES ('test-user-id');
-- Should show Admin rank regardless of XP

-- Test rank update
UPDATE user_gamification 
SET total_xp = 150, rank_code = 'NOOB'
WHERE user_id = 'test-user-id';
-- Next XP award should trigger rank up to Rookie
```

## Customization

### Adding New Ranks

```sql
INSERT INTO rank_definition (scale_code, code, name, min_xp, color, icon, sort_order)
VALUES ('free', 'LEGEND', 'Legend', 10000, 'gold', 'star', 11);
```

### Creating Pro Scale

```sql
-- Add pro ranks
INSERT INTO rank_definition (scale_code, code, name, min_xp, color, icon, sort_order)
VALUES 
('pro', 'PRO_ROOKIE', 'Pro Rookie', 0, 'platinum', 'zap', 1),
('pro', 'PRO_ATHLETE', 'Pro Athlete', 500, 'diamond', 'trophy', 2);
-- ... add more pro ranks
```

### Changing User's Scale

```sql
UPDATE user_gamification
SET rank_scale_code = 'pro',
    rank_code = NULL  -- Will be recomputed on next XP award
WHERE user_id = 'user-id';
```

## Troubleshooting

### Rank Not Showing
- Check `user_gamification.rank_code` is not null
- Verify `rank_definition` table has seed data
- Check RLS policies allow reading rank tables

### Rank Not Updating
- Verify XP is actually being awarded
- Check `user_gamification.rank_code` in database
- Look for errors in browser console
- Ensure `addXP` hook is returning rank data

### Admin Rank Not Working
- Verify user_id is in `admin_user` table
- Check RLS policy allows reading admin_user
- Refresh the page after adding to admin_user

### Wrong Colors/Icons
- Check `rank_definition` has correct color/icon values
- Verify color maps in `rank-badge.tsx`
- Ensure icon name matches Lucide icon name

## Future Enhancements

- [ ] Pro rank scale with paid features
- [ ] Rank decay (lose rank if inactive)
- [ ] Seasonal ranks (special ranks for events)
- [ ] Rank-specific badges/perks
- [ ] Rank comparison with friends
- [ ] Rank history tracking
- [ ] Share rank achievement cards

## Files Modified/Created

### Created:
- `supabase/migrations/add_ranks_system.sql`
- `lib/hooks/use-ranks.ts`
- `components/ranks/rank-badge.tsx`
- `components/ranks/rank-card.tsx`
- `RANKS_SYSTEM.md`

### Modified:
- `supabase/schema.sql` (added rank tables + seed data)
- `lib/types/index.ts` (added rank types)
- `lib/hooks/use-gamification.ts` (integrated rank calculation)
- `components/gamification/gamification-panel.tsx` (added rank badge)
- `components/progress/progress-dashboard.tsx` (added rank card)
- `components/workout/workout-logger.tsx` (added rank-up toast)

## Summary

The ranks system is now fully functional and integrated into the app:
- ✅ 10 free ranks from Noob to Bodybuilder
- ✅ Automatic rank calculation on XP award
- ✅ Admin override support
- ✅ Beautiful UI with colored badges and progress bars
- ✅ Rank-up notifications with confetti
- ✅ Mobile-first responsive design
- ✅ Fully cosmetic (no gameplay effects)

Users will now see their rank proudly displayed alongside their level, motivating them to keep training and progressing! 💪


