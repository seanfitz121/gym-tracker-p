# Google AdSense Integration Guide

## 📋 Overview

Your app now includes non-invasive Google AdSense ads that **only show to free users**. Premium users enjoy an ad-free experience.

## ✨ Features

- ✅ **Premium users see no ads** - Automatic premium detection
- ✅ **Non-invasive placements** - Horizontal banners at page bottoms
- ✅ **Lazy loading** - Ads load after page content (better performance)
- ✅ **Responsive** - Adapts to mobile and desktop
- ✅ **Optional** - Easy to enable/disable with env variable

## 🚀 Setup Instructions

### Step 1: Create Google AdSense Account

1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Sign up with your Google account
3. Submit your site URL: `https://plateprogress.com` (or your domain)
4. Wait for approval (typically 1-2 days to 2 weeks)

### Step 2: Get Your Publisher ID

Once approved:

1. Go to **AdSense Dashboard** → **Account** → **Settings**
2. Find your **Publisher ID** (starts with `ca-pub-XXXXXXXXXXXXXXXX`)
3. Copy this ID

### Step 3: Create Ad Units

1. Go to **Ads** → **By ad unit** → **Display ads**
2. Create these ad units:

   **Ad Unit 1: Dashboard Banner**
   - Name: "Dashboard Bottom Banner"
   - Ad type: Display ads
   - Ad size: Responsive
   - Copy the **Ad slot ID** (e.g., `1234567890`)

   **Ad Unit 2: History Inline**
   - Name: "History Inline Banner"
   - Ad type: Display ads → In-article
   - Copy the **Ad slot ID**

   **Ad Unit 3: Social Bottom**
   - Name: "Social Bottom Banner"
   - Ad type: Display ads
   - Ad size: Horizontal (728x90 / 320x50)
   - Copy the **Ad slot ID**

3. Save all your **ad slot IDs** - you'll need them!

### Step 4: Configure Environment Variables

Add to your `.env.local` file:

```bash
# Google AdSense Configuration
NEXT_PUBLIC_ADSENSE_ENABLED=true
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
```

Replace `ca-pub-XXXXXXXXXXXXXXXX` with your actual publisher ID.

### Step 5: Add Ad Slot IDs

Edit `lib/config/ads.ts` and replace the placeholder ad slot IDs:

```typescript
export const AD_SLOTS = {
  DASHBOARD_SIDEBAR: '1234567890',  // Your actual ad slot ID
  HISTORY_INLINE: '0987654321',     // Your actual ad slot ID
  SOCIAL_BOTTOM: '5678901234',      // Your actual ad slot ID
  TEMPLATES_TOP: '4321098765',      // Your actual ad slot ID (if you want more ads)
  PROGRESS_SIDEBAR: '6789012345',   // Your actual ad slot ID (if you want more ads)
} as const
```

### Step 6: Verify Installation

1. Restart your dev server: `npm run dev`
2. Log in as a **free user** (not premium)
3. Go to the Dashboard
4. Scroll to the bottom - you should see:
   - Blank space (AdSense takes 24-48 hours to show real ads initially)
   - Or test ads if you're in AdSense test mode

### Step 7: Test Premium User Experience

1. Log in as a **premium user**
2. Navigate to Dashboard
3. Confirm you see: "✨ Ad-free experience as a premium member"
4. No ad scripts should load (check Network tab)

## 📍 Current Ad Placements

### Implemented (Non-Intrusive)

✅ **Dashboard** - Bottom of page, horizontal banner
- High traffic page
- After all content
- Doesn't interrupt user flow

### Recommended (Not Yet Implemented)

You can add more ads by importing `AdBanner` into these pages:

```typescript
import { AdBanner } from '@/components/ads/ad-banner'
import { AD_SLOTS } from '@/lib/config/ads'
```

**History Page** - Between weekly summaries:
```tsx
<AdBanner 
  adSlot={AD_SLOTS.HISTORY_INLINE} 
  adFormat="auto"
  className="my-6"
/>
```

**Social Page** - Bottom of leaderboard:
```tsx
<AdBanner 
  adSlot={AD_SLOTS.SOCIAL_BOTTOM} 
  adFormat="horizontal"
  className="mt-8"
/>
```

**Templates Page** - Top of page:
```tsx
<AdBanner 
  adSlot={AD_SLOTS.TEMPLATES_TOP} 
  adFormat="horizontal"
  className="mb-6"
/>
```

## 🎨 Ad Customization

### Ad Formats

```tsx
<AdBanner 
  adSlot="YOUR_SLOT_ID"
  adFormat="auto"        // Auto-size (recommended)
  // OR
  adFormat="horizontal"  // 728x90 / 320x50
  // OR
  adFormat="vertical"    // 160x600 / 300x600
  // OR
  adFormat="rectangle"   // 300x250 / 336x280
/>
```

### Styling

```tsx
<AdBanner 
  adSlot="YOUR_SLOT_ID"
  className="my-8 rounded-lg shadow-sm"  // Tailwind classes
  showPlaceholder={true}  // Shows "Ad-free" message to premium users
/>
```

## 💰 Expected Revenue

### Realistic Estimates (Fitness/Health Niche)

**Per 1,000 Page Views (RPM):**
- Low estimate: $0.50 - $2.00
- Average: $2.00 - $5.00
- High (with optimization): $5.00 - $10.00

**Monthly Revenue Examples:**

| Free Users | Page Views/User/Month | Total Page Views | Estimated Revenue |
|------------|----------------------|------------------|-------------------|
| 100        | 50                   | 5,000            | $10 - $50         |
| 500        | 50                   | 25,000           | $50 - $250        |
| 1,000      | 50                   | 50,000           | $100 - $500       |
| 5,000      | 50                   | 250,000          | $500 - $2,500     |

**Variables affecting revenue:**
- User location (US/EU pays more)
- Click-through rate (CTR)
- Ad relevance
- Number of ads per page
- Time on site

## 🎯 Best Practices

### DO ✅

- **Keep ads non-intrusive** - Don't annoy users
- **Mobile-first** - Most users are mobile
- **Above-the-fold limit** - Max 3 ads above scroll
- **Premium value** - Make ad-free a selling point
- **Test placements** - Monitor which perform best

### DON'T ❌

- **Too many ads** - Hurts user experience AND revenue
- **Intrusive formats** - Popups, interstitials (banned by policy)
- **Click encouragement** - "Click here" violates AdSense policy
- **Fake traffic** - Will get you banned
- **Premium users** - Never show ads to paying users

## 📊 Monitoring Performance

### AdSense Dashboard

1. **Ad units** - See which placements perform best
2. **Earnings** - Daily revenue tracking
3. **CTR** - Click-through rate (1-5% is normal)
4. **RPM** - Revenue per 1,000 impressions

### Optimization Tips

1. **A/B test placements** - Try different positions
2. **Color matching** - Match your site's theme
3. **Ad balance** - AdSense's auto-optimization tool
4. **Remove low performers** - Focus on high-revenue placements

## 🔧 Troubleshooting

### Ads Not Showing

**For newly approved accounts:**
- Wait 24-48 hours after approval
- AdSense needs to crawl your site
- Initial ads may be blank/test ads

**Check:**
```bash
# Verify env variables are set
echo $NEXT_PUBLIC_ADSENSE_ENABLED  # Should be "true"
echo $NEXT_PUBLIC_ADSENSE_CLIENT_ID  # Should be "ca-pub-..."
```

**In browser console:**
- No errors about adsbygoogle
- Script loads: Check Network tab for `adsbygoogle.js`
- Ads pushed: Check for `window.adsbygoogle` array

### Ads Showing to Premium Users

Check your `usePremiumStatus` hook:
```typescript
const { isPremium, loading } = usePremiumStatus()
```

Verify database:
```sql
SELECT id, status FROM premium_subscription WHERE user_id = 'USER_ID';
```

### Policy Violations

**Common issues:**
- Too many ads on one page
- Ads on error pages (remove from 404, 500)
- Accidental clicks (spacing too close to buttons)
- Adult content / prohibited content

**Fix immediately if notified** - Policy violations can result in ban!

## 🚀 Deployment

### Production Checklist

- [ ] AdSense account approved
- [ ] Publisher ID added to production env
- [ ] Ad slot IDs configured
- [ ] Tested with premium users (no ads shown)
- [ ] Tested with free users (ads shown)
- [ ] Ads.txt file added (see below)
- [ ] Privacy policy updated (mention ads)

### Add ads.txt File

Create `public/ads.txt` with:

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

Replace `pub-XXXXXXXXXXXXXXXX` with your publisher ID.

This file helps prevent ad fraud and improves revenue.

### Privacy Policy Update

Add to your privacy policy:

> **Third-Party Advertising**
>
> We use Google AdSense to serve ads to free users. Google may use cookies and web beacons to serve ads based on your browsing history. You can opt out of personalized advertising by visiting [Ads Settings](https://www.google.com/settings/ads).

## 💡 Alternative: Programmatic Ads

If AdSense rejects your site or you want higher revenue:

### Alternatives to Consider

1. **Mediavine** (requires 50k sessions/month)
   - Higher RPM: $15-$30
   - Better optimization
   - Fitness niche friendly

2. **Ezoic** (no minimum)
   - AI-powered optimization
   - Revenue share model
   - Good for smaller sites

3. **Carbon Ads** (tech/dev audience)
   - Clean, minimal ads
   - Higher quality advertisers
   - Lower inventory

## 📈 Growth Strategy

### Maximize Ad Revenue

1. **Grow free user base** - More users = more revenue
2. **Increase engagement** - More page views per user
3. **Optimize placements** - Test different positions
4. **Balance ads vs premium** - Don't make free version unusable

### Conversion to Premium

**Use ads strategically:**
- Remind users premium = ad-free
- Show "Upgrade to remove ads" occasionally
- Make free tier useful but premium more valuable

**Example messaging:**
```
"Enjoying Plate Progress? Upgrade to Premium for an ad-free 
experience plus exclusive features like Progress Photos, 
Export Workouts, and Prestige Mode."
```

## 🎉 You're Done!

Your site is now monetized through Google AdSense! 

**Key takeaways:**
- ✅ Non-intrusive ads for free users
- ✅ Premium users see no ads
- ✅ Easy to expand with more placements
- ✅ Revenue supports app maintenance

Monitor your AdSense dashboard regularly and adjust placements based on performance!

