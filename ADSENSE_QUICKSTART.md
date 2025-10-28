# Google AdSense - Quick Setup

## ⚡ Quick Start (5 Minutes)

### 1. Add Environment Variables

Add to `.env.local`:

```bash
# Google AdSense
NEXT_PUBLIC_ADSENSE_ENABLED=true
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
```

### 2. Get Your AdSense Publisher ID

1. Sign up at [Google AdSense](https://www.google.com/adsense/)
2. Get approved (1-2 days to 2 weeks)
3. Copy your **Publisher ID** (starts with `ca-pub-`)
4. Replace `XXXXXXXXXXXXXXXX` above

### 3. Create Ad Units & Update Config

1. In AdSense Dashboard → **Ads** → **By ad unit**
2. Create "Display ad" units
3. Copy each **Ad slot ID**
4. Update `lib/config/ads.ts`:

```typescript
export const AD_SLOTS = {
  DASHBOARD_SIDEBAR: 'YOUR_AD_SLOT_ID_1',  // ← Replace these
  HISTORY_INLINE: 'YOUR_AD_SLOT_ID_2',
  SOCIAL_BOTTOM: 'YOUR_AD_SLOT_ID_3',
  TEMPLATES_TOP: 'YOUR_AD_SLOT_ID_4',
  PROGRESS_SIDEBAR: 'YOUR_AD_SLOT_ID_5',
}
```

### 4. Deploy & Wait

- Deploy to production
- Wait 24-48 hours for ads to appear
- Initially may show blank or test ads

## ✅ What's Included

### Components Created

```
components/ads/ad-banner.tsx    ← Reusable ad component
lib/config/ads.ts              ← Ad configuration
```

### Current Placements

- ✅ **Dashboard** - Bottom banner (free users only)

### How It Works

```typescript
// Automatically checks premium status
<AdBanner 
  adSlot={AD_SLOTS.DASHBOARD_SIDEBAR}
  adFormat="horizontal"
  showPlaceholder={true}  // Shows "Ad-free" to premium users
/>
```

## 🎯 Key Features

- ✅ **Premium users see no ads** (automatic detection)
- ✅ **Lazy loading** (doesn't slow down page load)
- ✅ **Responsive** (adapts to mobile/desktop)
- ✅ **Easy to disable** (set `ADSENSE_ENABLED=false`)

## 📍 Add More Ads (Optional)

Import into any page:

```typescript
import { AdBanner } from '@/components/ads/ad-banner'
import { AD_SLOTS } from '@/lib/config/ads'

// Add anywhere in your JSX:
<AdBanner 
  adSlot={AD_SLOTS.HISTORY_INLINE} 
  adFormat="auto"
  className="my-6"
/>
```

**Recommended placements:**
- History page (between workout weeks)
- Social page (bottom of leaderboard)
- Templates page (top of page)
- Progress page (sidebar)

**DON'T add to:**
- Premium-only pages (Progress Photos, etc.)
- Auth pages
- Logged-out pages (unless you want that)

## 💰 Expected Revenue

**Rough estimates:**
- 100 free users → $10-$50/month
- 500 free users → $50-$250/month
- 1,000 free users → $100-$500/month

**Variables:**
- Page views per user
- User location (US/EU pays more)
- Click-through rate
- Ad relevance

## 🚨 Important Notes

### AdSense Policies

❌ **DON'T:**
- Show ads to premium users (we handle this ✅)
- Put too many ads on one page (3-4 max)
- Use popups or interstitials
- Encourage clicks ("Click here!")

✅ **DO:**
- Keep ads non-intrusive
- Update privacy policy (mention ads)
- Add `public/ads.txt` file (see main guide)
- Monitor performance in AdSense dashboard

### Premium User Experience

Premium users will see:
```
✨ Ad-free experience as a premium member
```

This reinforces the value of premium!

## 📊 Testing

### As Free User
1. Log in as non-premium user
2. Go to Dashboard
3. Scroll to bottom
4. You should see:
   - Blank space (if ads not yet approved)
   - Test ads (if in AdSense test mode)
   - Real ads (after 24-48 hours)

### As Premium User
1. Log in as premium user
2. Go to Dashboard
3. Scroll to bottom
4. You should see:
   - "✨ Ad-free experience" message
   - No ad scripts loaded (check Network tab)

## 🎉 You're Done!

Your app now monetizes free users with non-intrusive ads while premium users enjoy an ad-free experience.

**Next steps:**
1. Get AdSense approval
2. Add publisher ID to `.env.local`
3. Update ad slot IDs in `lib/config/ads.ts`
4. Deploy and wait 24-48 hours
5. Monitor AdSense dashboard

**Full documentation:** See `ADSENSE_SETUP.md` for detailed guide.

## 🔗 Resources

- [Google AdSense](https://www.google.com/adsense/)
- [AdSense Policies](https://support.google.com/adsense/answer/48182)
- [Optimize Ad Revenue](https://support.google.com/adsense/answer/9170252)

