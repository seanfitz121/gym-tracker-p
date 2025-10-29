# AdSense Troubleshooting Guide

## Error: `ERR_BLOCKED_BY_CLIENT`

This error means something on YOUR SYSTEM is blocking the ads, not an issue with the code.

## Quick Diagnosis

### 1. Test in Incognito Mode
- **Chrome/Edge:** `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)
- **Firefox:** `Ctrl+Shift+P`
- **Safari:** `Cmd+Shift+N`

**If ads work in incognito:** You have a browser extension blocking ads.

### 2. Check Browser Extensions
Open your extensions page and **disable ALL extensions**:
- Chrome: `chrome://extensions`
- Firefox: `about:addons`
- Edge: `edge://extensions`
- Safari: Preferences → Extensions

Common ad-blocking extensions:
- ❌ uBlock Origin
- ❌ AdBlock / AdBlock Plus
- ❌ Privacy Badger
- ❌ Ghostery
- ❌ DuckDuckGo Privacy Essentials
- ❌ Disconnect
- ❌ NoScript
- ❌ HTTPS Everywhere (sometimes)
- ❌ Any VPN extension
- ❌ Any "Privacy" extension

### 3. Check Browser Settings

#### **Brave Browser**
- Has built-in ad/tracker blocking (Brave Shields)
- Click the lion icon in address bar → Turn off Shields

#### **Firefox**
- Enhanced Tracking Protection blocks ads by default
- Click shield icon → Turn off for this site

#### **Safari**
- Intelligent Tracking Prevention can block ads
- Safari → Preferences → Privacy → Uncheck "Prevent cross-site tracking"

#### **Edge**
- Tracking prevention can block ads
- Settings → Privacy → Tracking prevention → Set to "Basic"

### 4. Check Antivirus/Security Software
Many antivirus programs have "Web Protection" that blocks ads:
- Kaspersky
- Norton
- Avast
- AVG
- Bitdefender
- McAfee

**Solution:** Add `plateprogress.com` to whitelist or disable web protection.

### 5. Check Network-Level Blocking
If ads don't work even in incognito with all extensions disabled:

#### **DNS-Level Blocking**
- AdGuard DNS
- NextDNS
- Cloudflare for Families
- OpenDNS FamilyShield
- Pi-hole on your network

**Solution:** Switch to regular DNS (8.8.8.8 or 1.1.1.1) temporarily to test.

#### **Router-Level Blocking**
- Some routers have ad-blocking features
- Check router admin panel

#### **Corporate/School Network**
- Many workplaces/schools block ads at the network level
- Test on mobile data or home network

### 6. Check AdSense Account Status

#### **Account Pending Approval**
If your AdSense account shows "Getting ready" or "Under review":
- Ads **will not show** until fully approved
- Can take 24-48 hours after initial approval
- Check AdSense dashboard for status

#### **Ads.txt File**
Verify `https://plateprogress.com/ads.txt` exists and contains:
```
google.com, pub-9610700167630671, DIRECT, f08c47fec0942fa0
```

#### **Payment Information**
- Ensure payment info is complete in AdSense
- Ads won't show if payment threshold not set up

### 7. Check Ad Inventory
Even with everything correct, ads might not show if:
- **New account:** Takes 24-48 hours for Google to serve ads
- **Low traffic:** Limited ad inventory for new/low-traffic sites
- **Geographic location:** Some regions have less ad inventory
- **Content review:** Google reviewing your content for ad suitability

## Test Page

Visit: `https://plateprogress.com/test-ads`

This page has diagnostic information and test ad units.

## Expected Console Messages

### ✅ Good Signs
- No errors
- Blank space where ad should be (means AdSense loaded but no inventory)
- `(adsbygoogle = window.adsbygoogle || []).push({})` executed successfully

### ❌ Bad Signs (Your Issue)
```
ERR_BLOCKED_BY_CLIENT
```
**Meaning:** Your browser/network/antivirus is blocking ads.

**Solution:** Follow steps 1-5 above.

### ⚠️ Configuration Issues
```
adsbygoogle.push() error: No slot size for availableWidth=0
```
**Meaning:** Ad container has no width (CSS issue)

```
adsbygoogle.push() error: All 'ins' elements in the DOM with class=adsbygoogle already have ads in them.
```
**Meaning:** Double-pushing ads (code issue)

## Testing Checklist

Use this checklist to diagnose:

- [ ] Tested in incognito/private mode
- [ ] Disabled ALL browser extensions
- [ ] Tried different browser entirely
- [ ] Tried different network (mobile data vs WiFi)
- [ ] Checked browser privacy settings
- [ ] Checked antivirus web protection
- [ ] Verified AdSense account is fully approved
- [ ] Waited 24-48 hours since AdSense approval
- [ ] Checked ads.txt file exists
- [ ] Visited test page and checked console

## Still Not Working?

### Verify Environment Variable
Check `.env.local` has:
```
NEXT_PUBLIC_ADSENSE_ENABLED=true
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-9610700167630671
```

### Verify Script Loading
Open page source (Ctrl+U) and search for "adsbygoogle". You should see:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9610700167630671" crossorigin="anonymous"></script>
```

### Check Premium Status
Verify the test account is NOT premium:
1. Go to `/app/premium`
2. Should NOT show "Premium Active"
3. If premium, ads won't show (working as intended)

## AdSense Timeline

After account approval:
- **Day 1:** Ads may not show (Google reviewing site)
- **Day 2-3:** Limited ad inventory
- **Week 1:** Ad fill rate increases
- **Week 2+:** Normal ad serving

## Common Misconceptions

### ❌ "I disabled uBlock Origin"
- **Wrong:** Disabling in the extension popup only disables for THAT PAGE
- **Correct:** Go to `chrome://extensions` and toggle OFF completely

### ❌ "I'm using Chrome, no ad blockers"
- Chrome can have extensions you forgot about
- Privacy extensions also block ads
- Check `chrome://extensions` - you might be surprised

### ❌ "I whitelisted the site"
- Some blockers still block even when whitelisted
- Test in incognito to be sure

## For Developers

The AdSense integration is correct. The `ERR_BLOCKED_BY_CLIENT` error is NOT a code issue.

### Ad Banner Component
Located: `components/ads/ad-banner.tsx`
- ✅ Checks premium status
- ✅ Only shows to free users
- ✅ Uses correct data attributes
- ✅ Async script loading

### Ad Placements
- Dashboard: Bottom (slot: 7306690705)
- Workout Logger: Bottom (slot: 4020668929)
- History/Progress/Social/Tools: Bottom (slot: 7009794341)

### Premium Override
Premium users see:
```
✨ Ad-free experience as a premium member
```

Free users see actual ads.

## Final Notes

**99% of the time** `ERR_BLOCKED_BY_CLIENT` means:
1. Browser extension blocking ads
2. Browser privacy feature blocking ads
3. Antivirus blocking ads
4. Network-level blocking

The code is working correctly. The issue is client-side blocking.

