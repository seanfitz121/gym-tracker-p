# Leaderboard Testing Guide

## Quick Test Steps

### 1. Test Individual Account

1. **Login** with test account #1
2. **Complete a workout** (any exercises, at least 2 sets per exercise)
3. **Navigate to Social page** (leaderboard)
4. **Verify**: You should immediately see your account with:
   - XP earned (100 base + 1 per kg of volume)
   - Workout count (1)
   - Total volume in kg

### 2. Test Friends Leaderboard

1. **Login** with test account #1
2. **Add test account #2 as friend** (if not already friends)
3. **Accept friend request** from test account #2
4. **Complete a workout** on test account #1
5. **Logout and login** with test account #2
6. **Complete a workout** on test account #2
7. **Navigate to Social → Friends tab** on leaderboard
8. **Verify**: Both accounts should appear ranked by XP

### 3. Test Leaderboard Updates

1. **Complete another workout** on the same account
2. **Refresh the leaderboard**
3. **Verify**: 
   - Workout count increased
   - XP increased
   - Volume increased
   - Ranking updated if applicable

### 4. Test Workout Deletion

1. **Go to History page**
2. **Delete a recent workout**
3. **Go back to leaderboard**
4. **Verify**: Stats are updated to reflect the deletion

## Expected XP Calculation

```
Total XP = (Number of Workouts × 100) + Total Volume in kg
```

**Example:**
- 2 workouts this week
- Workout 1: 400kg total volume
- Workout 2: 600kg total volume
- **Total XP = (2 × 100) + 1000 = 1200 XP**

## Time Ranges

The leaderboard supports three time ranges:
- **Week**: Current ISO week (Sunday to Saturday)
- **Month**: Current calendar month
- **All**: All-time stats

Make sure the "Week" tab is selected when testing, as that's the default.

## Common Issues & Solutions

### "Add friends to see their rankings"

**Possible causes:**
1. No friend relationships exist
2. Friends haven't completed any workouts THIS WEEK
3. It's a new week and last week's data isn't being shown

**Solution:**
- Ensure both accounts have completed workouts THIS WEEK
- Check that friend request was accepted (bidirectional relationship)

### Empty Leaderboard

**Possible causes:**
1. No workouts completed this week
2. All workouts were from previous weeks

**Solution:**
- Complete a new workout
- Check that today's date falls within the current ISO week

### Wrong Week Calculation

**If you suspect week numbers are off:**
1. Check browser console for logged week number
2. Compare with the current ISO week
3. Note: Weeks start on Sunday (0) and end on Saturday (6)

## Database Inspection (Optional)

To verify the data is being stored correctly:

```sql
-- Check weekly_xp table
SELECT * FROM weekly_xp 
WHERE user_id = 'YOUR_USER_ID'
ORDER BY iso_week DESC;

-- Check current ISO week
SELECT 
  EXTRACT(year FROM NOW())::int * 100 + 
  EXTRACT(week FROM NOW())::int as current_week;

-- Check friend relationships
SELECT * FROM friend 
WHERE user_id = 'YOUR_USER_ID' 
   OR friend_id = 'YOUR_USER_ID';
```

## Success Criteria

✅ Leaderboard shows data immediately after workout completion
✅ Friends leaderboard shows all friends who worked out this week
✅ XP, workout count, and volume are accurate
✅ Rankings update correctly when new workouts are added
✅ Stats update correctly when workouts are deleted
✅ No errors in browser console

