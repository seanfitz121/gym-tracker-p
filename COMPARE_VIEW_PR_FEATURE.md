# Compare View - Exercise PR Comparison Feature

## Overview

Added a new **Exercise PR Comparison** card to the compare view that allows users to select an exercise and view personal records (PRs) side-by-side with their friend.

## Features

### 1. Exercise Selection Dropdown

- **Searchable dropdown** with all exercises both users have performed
- Exercises sorted alphabetically
- Shows exercise name and body part (e.g., "Bench Press • Chest")
- Placeholder: "Select an exercise to compare PRs..."

### 2. Best PR Display

Shows the best (most recent) PR for each user:
- **Weight and reps**: "100 kg × 5 reps"
- **Estimated 1RM**: Calculated from the PR
- **Green highlight**: Winner (higher 1RM) gets green background
- **PR count**: Total number of PRs for that exercise
- **"No PRs yet"** message if user hasn't set any PRs

### 3. PR History

If either user has more than one PR:
- Shows up to 4 historical PRs for each user
- Displays weight × reps
- Shows date achieved
- Side-by-side comparison layout

### 4. Responsive Design

- **Mobile**: Compact layout with smaller text
- **Desktop**: Spacious layout with larger text
- Proper text sizing and spacing for all screen sizes

## Implementation Details

### New State Variables

```typescript
const [exercises, setExercises] = useState<Array<{
  id: string, 
  name: string, 
  body_part?: string
}>>([])
const [selectedExercise, setSelectedExercise] = useState<string>('')
const [prData, setPrData] = useState<{
  user: any[], 
  friend: any[]
} | null>(null)
const [prLoading, setPrLoading] = useState(false)
```

### Exercise Fetching

Fetches all unique exercises that either user has performed:

```typescript
useEffect(() => {
  // 1. Get all workout sessions for both users
  const { data: sessions } = await supabase
    .from('workout_session')
    .select('id, user_id')
    .in('user_id', [data?.user.id, data?.friend.id])
  
  // 2. Get all exercises from those sessions
  const { data: sets } = await supabase
    .from('set_entry')
    .select('exercise_id, exercise:exercise_id(id, name, body_part)')
    .in('session_id', sessionIds)
  
  // 3. Extract unique exercises
  // 4. Sort alphabetically
}, [data])
```

### PR Fetching

When an exercise is selected:

```typescript
useEffect(() => {
  // Fetch user's PRs
  const { data: userPRs } = await supabase
    .from('personal_record')
    .select('*')
    .eq('exercise_id', selectedExercise)
    .eq('user_id', data.user.id)
    .order('achieved_at', { ascending: false })
  
  // Fetch friend's PRs
  const { data: friendPRs } = await supabase
    .from('personal_record')
    .select('*')
    .eq('exercise_id', selectedExercise)
    .eq('user_id', data.friend.id)
    .order('achieved_at', { ascending: false })
}, [selectedExercise, data])
```

### Winner Highlighting

Green background applied to whoever has the higher estimated 1RM:

```typescript
const isWinner = prData.user.length > 0 && 
                 prData.friend.length > 0 && 
                 (prData.user[0].estimated_1rm || 0) > 
                 (prData.friend[0]?.estimated_1rm || 0)
```

## UI Structure

```
┌─────────────────────────────────────────┐
│ 🏆 Exercise PRs                        │
│ Compare personal records...            │
├─────────────────────────────────────────┤
│ [Select an exercise to compare PRs...▼]│
│                                         │
│ ┌────────────┐   ┌────────────┐       │
│ │    Sean    │   │ testuser1  │       │
│ │            │   │            │       │
│ │  100 kg    │   │   90 kg    │       │ ← Green highlight
│ │  5 reps    │   │   5 reps   │       │
│ │ Est. 1RM:  │   │ Est. 1RM:  │       │
│ │  112 kg    │   │  101 kg    │       │
│ │            │   │            │       │
│ │   4 PRs    │   │   2 PRs    │       │
│ └────────────┘   └────────────┘       │
│                                         │
│ PR History                             │
│ ────────────────────────────           │
│ 95 kg × 5      85 kg × 5              │
│ Jan 15, 2025   Dec 20, 2024           │
│                                         │
│ 90 kg × 6      80 kg × 6              │
│ Jan 1, 2025    Dec 1, 2024            │
└─────────────────────────────────────────┘
```

## Responsive Breakpoints

### Mobile (< 640px)
- `text-lg` for weight numbers
- `text-xs` for reps and labels
- `text-[10px]` for 1RM estimate
- `p-3` padding
- `gap-2` spacing

### Desktop (≥ 640px)
- `text-2xl` for weight numbers
- `text-sm` for reps and labels
- `text-xs` for 1RM estimate
- `p-4` padding
- `gap-4` spacing

## Data Flow

1. **Component Mounts** → Fetch compare data
2. **Compare Data Loaded** → Fetch all exercises
3. **User Selects Exercise** → Fetch PRs for both users
4. **PRs Loaded** → Display comparison
5. **User Changes Exercise** → Refetch PRs

## Files Modified

- `components/social/compare-view.tsx`
  - Added imports: `Select`, `Award`, `createClient`
  - Added state for exercises, selected exercise, PR data
  - Added 3 useEffect hooks for data fetching
  - Added Exercise PR Comparison card UI
  - Added responsive PR display
  - Added PR history section

## User Experience

### Empty States
- **No exercises**: Dropdown shows no options (both users need to have logged workouts)
- **No exercise selected**: "Select an exercise to compare PRs..."
- **No PRs**: "No PRs yet" message for users without PRs
- **Loading**: Spinner while fetching PR data

### Interaction Flow
1. User opens compare view
2. Scrolls down to "Exercise PRs" card
3. Clicks dropdown and sees all exercises
4. Selects an exercise (e.g., "Bench Press")
5. Instantly sees best PR for each user
6. Winner gets green highlight
7. Can scroll to see PR history
8. Can change exercise to compare different lifts

## Benefits

### For Users
- ✅ **Quick comparison** of strength on specific lifts
- ✅ **Friendly competition** with visual winner highlighting
- ✅ **Progress tracking** through PR history
- ✅ **Exercise discovery** - see what lifts friends are doing
- ✅ **Motivation** - see friend's PRs and try to beat them

### For Engagement
- ✅ **Increased interaction** between friends
- ✅ **Competitive element** drives more workouts
- ✅ **Social proof** - "My friend benches 100kg, I should try harder!"
- ✅ **Discovery** - Learn new exercises from friends

## Future Enhancements

### Possible Improvements
1. **Chart visualization**: Line chart of PR progression over time
2. **Multiple exercises**: Compare multiple exercises at once
3. **Percentile rankings**: "You're in the top 10% for this exercise"
4. **Share achievements**: Share PR comparisons on social media
5. **Challenge system**: Challenge friend to beat your PR
6. **Filters**: Filter by body part or exercise type
7. **Search**: Search within exercises instead of scrolling
8. **Rep range filter**: Compare PRs at specific rep ranges (1RM, 5RM, etc.)
9. **Unit conversion**: Auto-convert between kg and lb
10. **Export**: Export PR comparison as image

## Technical Notes

### Performance
- Exercises fetched once when compare data loads
- PRs only fetched when exercise selected (lazy loading)
- Proper loading states prevent UI jank
- Efficient queries with proper indexes

### Data Accuracy
- PRs ordered by `achieved_at` descending (most recent first)
- Uses `estimated_1rm` for winner determination
- Falls back to 0 if 1RM not calculated
- Handles edge cases (no PRs, one user has PRs, equal PRs)

### Mobile Optimization
- Responsive text sizes prevent overflow
- Compact layout fits mobile screens
- Proper truncation for long exercise names
- Touch-friendly select dropdown

## Related Features

Works well with:
- Compare stats (Last 7/30/90 Days)
- All-time stats comparison
- XP and Volume trend charts
- Leaderboards
- Progress tracking

## Testing

### Test Cases
1. **Both users have PRs** → Show comparison with winner highlighted
2. **Only one user has PRs** → Show that user's PR, other shows "No PRs yet"
3. **Neither user has PRs** → Both show "No PRs yet"
4. **Equal PRs** → No green highlight
5. **Multiple PRs** → Show history section
6. **Single PR each** → No history section
7. **No exercises** → Empty dropdown
8. **Mobile view** → Responsive layout works
9. **Long exercise names** → Truncate properly
10. **Switching exercises** → Loading state, then new data

### How to Test
1. Compare two users who have completed workouts
2. Select various exercises
3. Verify PR data accuracy
4. Test on mobile and desktop
5. Try with users who have no PRs
6. Test loading states

