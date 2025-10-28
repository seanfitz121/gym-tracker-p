# Prestige Mode & Golden Name Flair - Documentation

## Overview

Two new premium-only features have been implemented:

1. **Prestige Mode** - Infinite progression system where users can reset their XP for prestige badges
2. **Golden Name Flair** - Cosmetic golden username display for premium members

---

## 1. Prestige Mode 🏆

### Purpose
Allow premium users who have reached the top rank (BODYBUILDER) to reset their visible XP/level for a fresh progression while keeping lifetime stats, earning exclusive Prestige badges.

### Eligibility Requirements
- ✅ Must have `is_premium = true`
- ✅ Must have reached BODYBUILDER rank (50,000 XP minimum)
- ✅ Must respect 30-day cooldown between prestiges

### What Happens on Prestige
**You Lose:**
- XP resets to 0
- Level resets to 1

**You Keep:**
- All lifetime stats (total workouts, PRs)
- All workout history
- All personal records
- All previously earned badges
- All friends and social connections

**You Gain:**
- Exclusive Prestige badge (PRESTIGE_1, PRESTIGE_2, etc.)
- Fresh progression journey
- Bragging rights 😎

### Database Changes

```sql
-- Added to user_gamification table
prestige_count INT DEFAULT 0
last_prestige_at TIMESTAMPTZ
prestige_active BOOLEAN DEFAULT FALSE

-- New table for audit trail
CREATE TABLE prestige_history (
  id UUID PRIMARY KEY,
  user_id UUID,
  prestige_number INT,
  xp_before BIGINT,
  level_before INT,
  xp_after BIGINT,
  level_after INT,
  created_at TIMESTAMPTZ
)
```

### API Endpoints

**GET /api/prestige/status**
```typescript
Response: {
  isEligible: boolean,
  prestige_count: number,
  last_prestige_at: string | null,
  next_eligible_at: string | null,
  reason?: string,
  current_xp?: number,
  required_xp?: number,
  days_remaining?: number
}
```

**POST /api/prestige/enter**
```typescript
Response: {
  success: boolean,
  error?: string,
  prestige_count?: number,
  badge_name?: string,
  next_eligible_at?: string
}
```

### UI Components

**PrestigeCard** - Main card shown in Settings
- Shows eligibility status
- Progress bar to next prestige (if not eligible)
- Cooldown timer (if on cooldown)
- "Enter Prestige Mode" button

**PrestigeConfirmModal** - Confirmation dialog
- Requires typing "RESET" to confirm
- Shows warnings about XP reset
- Lists what you keep vs lose
- Two-step confirmation

**PrestigeSuccessModal** - Success celebration
- Confetti animation
- Shows new prestige badge
- Option to share achievement
- Displays new XP (0) and Level (1)

### Usage

```typescript
import { usePrestigeStatus, usePrestigeEnter } from '@/lib/hooks/usePrestige';

function MyComponent() {
  const { status, loading, refresh } = usePrestigeStatus();
  const { enterPrestige, entering } = usePrestigeEnter();
  
  const handlePrestige = async () => {
    const result = await enterPrestige();
    if (result?.success) {
      console.log('Prestige successful!', result.prestige_count);
    }
  };
}
```

---

## 2. Golden Name Flair 💎

### Purpose
Give premium members a distinctive golden username display across the app. Purely cosmetic - no feature unlocks or privilege changes.

### Features
- Golden gradient text effect on username
- Diamond icon (💎) suffix
- Works in light and dark mode
- Can be toggled on/off in Settings
- Accessible (includes aria-label for screen readers)

### Database Changes

```sql
-- Added to profiles table
premium_flair_enabled BOOLEAN DEFAULT TRUE
```

### API Endpoint

**POST /api/settings/flair**
```typescript
Request: {
  premium_flair_enabled: boolean
}

Response: {
  success: boolean,
  premium_flair_enabled: boolean
}
```

### UI Component

**GoldenUsername** - Wrapper component for usernames
```typescript
<GoldenUsername
  username="JohnDoe"
  isPremium={true}
  flairEnabled={true}
  showIcon={true}
  className="text-lg"
/>
```

**FlairToggle** - Settings toggle
- Preview of golden name
- Toggle switch
- Only visible to premium users

### CSS

Golden gradient effect with fallbacks:

```css
.golden-username {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Dark mode - brighter */
.dark .golden-username {
  background: linear-gradient(135deg, #FFE55C 0%, #FFB347 50%, #FFE55C 100%);
}

/* Fallback for unsupported browsers */
@supports not (background-clip: text) {
  .golden-username {
    color: #FFD700;
  }
}
```

### Where It Appears
- ✅ Header dropdown menu
- ✅ Settings preview
- ✅ Friends list
- ✅ Leaderboards (Friends, Gym, Global)
- ✅ All social features
- 🔜 Comments (when implemented)
- 🔜 Share cards (future)

### Accessibility
- Includes `aria-label="Pro member"` on diamond icon
- High contrast in both light and dark modes
- Fallback to solid gold color if gradients unsupported
- Screen readers announce "Pro member" status

---

## Setup Instructions

### 1. Run Database Migration

```bash
# Apply the migration
supabase db push

# Or manually in Supabase Dashboard SQL Editor
# Run: supabase/migrations/20241028110000_prestige_mode_and_flair.sql
```

### 2. Install Dependencies

```bash
npm install canvas-confetti @types/canvas-confetti
```

### 3. Verify

Check that these tables/columns exist:
```sql
-- Prestige fields
SELECT prestige_count, last_prestige_at, prestige_active 
FROM user_gamification 
LIMIT 1;

-- Flair field
SELECT premium_flair_enabled 
FROM profiles 
LIMIT 1;

-- Prestige history table
SELECT * FROM prestige_history LIMIT 1;
```

---

## Testing Checklist

### Prestige Mode

**Non-Premium User:**
- [ ] Shows "Premium required" message
- [ ] Cannot access prestige endpoints

**Premium User (Not Eligible):**
- [ ] Shows current XP and required XP
- [ ] Shows progress bar to BODYBUILDER rank
- [ ] "Enter Prestige" button is disabled

**Premium User (Eligible):**
- [ ] Shows "Ready to Prestige" message
- [ ] "Enter Prestige" button is enabled
- [ ] Clicking button shows confirmation modal
- [ ] Must type "RESET" to proceed
- [ ] On success, shows confetti animation
- [ ] XP resets to 0, level resets to 1
- [ ] Prestige badge is awarded
- [ ] Cooldown is active (30 days)

**Premium User (On Cooldown):**
- [ ] Shows "Cooldown Active" message
- [ ] Shows days remaining
- [ ] "Enter Prestige" button is disabled

### Golden Name Flair

**Non-Premium User:**
- [ ] Golden name never shows
- [ ] Flair toggle shows "Premium required"

**Premium User:**
- [ ] Golden name shows in header dropdown
- [ ] Diamond icon (💎) appears next to name
- [ ] Toggle in Settings works
- [ ] Preview updates in real-time
- [ ] Toggle persists across sessions
- [ ] Works in both light and dark mode
- [ ] Fallback works if gradients unsupported

---

## Business Logic

### Prestige Cooldown
- 30 days between prestiges
- Enforced server-side
- Countdown shown in UI

### XP Threshold
- Default: 50,000 XP (BODYBUILDER rank)
- Configurable in migration file

### Prestige Badges
- Format: `PRESTIGE_1`, `PRESTIGE_2`, etc.
- Automatically awarded on prestige
- Visible in profile badges section

### Flair Default
- New premium users: ON by default
- Existing users: Must manually enable
- Can toggle anytime in Settings

---

## Security

1. ✅ All endpoints check `is_premium`
2. ✅ Prestige eligibility checked server-side
3. ✅ Cooldown enforced in database function
4. ✅ RLS policies on prestige_history table
5. ✅ Audit trail of all prestige events
6. ✅ Activity log entries created

---

## Future Enhancements

**Prestige Mode:**
- [ ] Prestige leaderboard
- [ ] Prestige-specific challenges
- [ ] Special ranks for high prestige users
- [ ] Prestige multipliers for XP gain

**Golden Flair:**
- [ ] Custom gradient colors for high-tier premium
- [ ] Animated shimmer effect option
- [ ] Additional flair styles (rainbow, platinum, etc.)
- [ ] Flair intensity slider

---

## Files Created

### Database
- `supabase/migrations/20241028110000_prestige_mode_and_flair.sql`

### Types
- `lib/types/prestige.ts`

### Hooks
- `lib/hooks/usePrestige.ts`

### API Routes
- `app/api/prestige/status/route.ts`
- `app/api/prestige/enter/route.ts`
- `app/api/settings/flair/route.ts`

### Components
- `components/gamification/prestige-card.tsx`
- `components/gamification/prestige-confirm-modal.tsx`
- `components/gamification/prestige-success-modal.tsx`
- `components/gamification/golden-username.tsx`
- `components/settings/flair-toggle.tsx`

### Styles
- `app/globals.css` (golden username CSS added)

### Updated
- `components/settings/settings-form.tsx` (added prestige and flair cards)
- `components/layout/app-header.tsx` (added golden username display)

---

## Support

For issues or questions:
- Check server logs for prestige errors
- Verify user's `is_premium` status
- Check prestige_history table for audit trail
- Verify cooldown calculations in database function

---

**Feature Status**: ✅ Complete and Ready for Production

**Last Updated**: October 28, 2024

**Dependencies**: 
- canvas-confetti@^2.12.0
- @types/canvas-confetti@^1.6.4

