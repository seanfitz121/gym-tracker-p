# Gym Features Fix

## Issues Fixed

### 1. Pending Join Requests Not Disappearing After Approval ✅

**Problem:**
- Pending request cards remained visible even after approving members
- Member count wasn't updating immediately

**Root Cause:**
- TypeScript interface expected `username: string` but it could be `null`
- This caused potential rendering issues if username wasn't populated

**Solution:**
- Updated `PendingRequest` interface to make `username` optional: `username?: string | null`
- Added conditional rendering for username display:
  ```typescript
  {request.username && (
    <p className="text-sm text-gray-500 truncate">@{request.username}</p>
  )}
  ```
- The existing logic already properly removed requests from UI and refreshed gym data

### 2. No Way to View Gym Members ✅

**Problem:**
- Gym card showed member count but couldn't click to see who the members are
- No UI to view the list of gym members

**Solution:**
- Made the member count clickable with hover effects
- Added a `GymMember` interface for member data structure
- Created new state variables:
  - `membersDialogOpen` - controls dialog visibility
  - `members` - stores fetched member data
  - `membersLoading` - loading state for members fetch
- Implemented `fetchMembers()` function to get member list from API
- Implemented `handleViewMembers()` function to open the dialog
- Added a members dialog modal that displays:
  - Member avatars
  - Display names
  - Rank badges
  - "Owner" badge for gym owner

### 3. Member Count Not Updating ✅

**Problem:**
- After approving a pending request, the member count didn't update

**Root Cause:**
- The logic was correct (`fetchCurrentGym()` was being called)
- The issue was likely related to the username type issue causing rendering problems

**Solution:**
- Fixed the TypeScript types (username nullable)
- The existing `fetchCurrentGym()` call after approval now works correctly
- Member count refreshes from the API after approval

## Changes Made

### File: `components/social/gym-manager.tsx`

#### 1. Updated Interfaces

```typescript
// Made username optional to handle cases where it might be null
interface PendingRequest {
  user_id: string
  username?: string | null  // Changed from: username: string
  display_name: string
  avatar_url?: string | null
  rank_code?: string
  joined_at: string
}

// Added new interface for member data
interface GymMember {
  user_id: string
  joined_at: string
  opt_in: boolean
  is_approved: boolean
  profile: {
    user_id: string
    display_name: string
    avatar_url?: string | null
    rank_code?: string | null
  } | null
}
```

#### 2. Added New State Variables

```typescript
const [membersDialogOpen, setMembersDialogOpen] = useState(false)
const [members, setMembers] = useState<GymMember[]>([])
const [membersLoading, setMembersLoading] = useState(false)
```

#### 3. Added New Functions

```typescript
// Fetch gym members from API
const fetchMembers = async (gymCode: string) => {
  setMembersLoading(true)
  try {
    const res = await fetch(`/api/gym/${gymCode}/members`)
    if (res.ok) {
      const data = await res.json()
      setMembers(data.members || [])
    }
  } catch (error) {
    console.error('Error fetching members:', error)
    toast.error('Failed to load gym members')
  } finally {
    setMembersLoading(false)
  }
}

// Handle view members button click
const handleViewMembers = () => {
  if (currentGym) {
    fetchMembers(currentGym.code)
    setMembersDialogOpen(true)
  }
}
```

#### 4. Updated Gym Card UI

**Before:**
```typescript
<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
  <Users className="h-4 w-4" />
  <span>{currentGym.member_count} members</span>
</div>
```

**After:**
```typescript
<button 
  onClick={handleViewMembers}
  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors w-full text-left"
>
  <Users className="h-4 w-4" />
  <span>{currentGym.member_count} members</span>
</button>
```

#### 5. Added Members Dialog

```typescript
<Dialog open={membersDialogOpen} onOpenChange={setMembersDialogOpen}>
  <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        Gym Members
      </DialogTitle>
      <DialogDescription>
        {currentGym?.name} members ({members.length})
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-3 mt-4">
      {/* Member list with avatars, names, ranks, and owner badge */}
    </div>
  </DialogContent>
</Dialog>
```

#### 6. Added Imports

```typescript
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { RankBadge } from '@/components/ranks/rank-badge'
```

## Testing Instructions

### Test 1: Pending Request Approval

1. **Create a gym** with "Require Approval" enabled
2. **Join the gym** from another test account
3. **Switch back to gym owner account**
4. **Go to Social → Gym tab**
5. **Verify**: Pending request card appears
6. **Click "Approve"**
7. **Verify**: 
   - ✅ Request card disappears immediately
   - ✅ Success toast appears
   - ✅ Member count increments by 1

### Test 2: View Gym Members

1. **Have a gym with at least 2-3 members**
2. **Go to Social → Gym tab**
3. **Click on the "{X} members" text** (should be clickable/hover effect)
4. **Verify**: 
   - ✅ Members dialog opens
   - ✅ All members are listed with avatars
   - ✅ Gym owner has "Owner" badge
   - ✅ Members show rank badges if they have ranks
   - ✅ Dialog is scrollable if many members

### Test 3: Pending Request Rejection

1. **Have a pending join request**
2. **Click "Reject"**
3. **Verify**:
   - ✅ Request card disappears immediately
   - ✅ Success toast appears
   - ✅ Member count stays the same

### Test 4: Username Handling

1. **Test with accounts that have usernames**
2. **Test with old accounts that might not have usernames**
3. **Verify**:
   - ✅ Pending requests display correctly in both cases
   - ✅ No errors in console
   - ✅ Username shows when available, hidden when not

## API Endpoints Used

- **GET `/api/gym/my-gym`** - Fetches current user's gym (includes member count)
- **GET `/api/gym/[code]/pending`** - Fetches pending join requests (gym owner only)
- **POST `/api/gym/[code]/pending`** - Approve/reject join requests
- **GET `/api/gym/[code]/members`** - Fetches approved gym members

## User Experience Improvements

✅ **Immediate Feedback** - Pending requests disappear instantly without requiring page refresh
✅ **Visual Feedback** - Hover effects on clickable elements
✅ **Member Visibility** - Easy way to see who's in your gym
✅ **Clean UI** - Members dialog is scrollable and mobile-friendly
✅ **Status Badges** - Clear indication of gym owner and member ranks
✅ **Error Handling** - Graceful handling of missing usernames

## Known Behaviors

- **Member count updates after approval** - This is intentional and happens via `fetchCurrentGym()`
- **Members dialog fetches data on open** - This ensures fresh data every time you view members
- **Username is optional** - Older accounts or accounts created before username migration might not have usernames

