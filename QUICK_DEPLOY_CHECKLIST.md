# 🚀 Quick Deploy Checklist

## Before Every Deploy

### 1. Update Service Worker (`public/sw.js`)

```javascript
const CACHE_VERSION = 'v4.2'                      // ← Increment this
const BUILD_TIMESTAMP = '2025-01-26T15:30:00Z'   // ← Update timestamp
```

### 2. Update Manifest (`public/manifest.json`)

```json
{
  "version": "4.2.0",            // ← Match service worker version
  "start_url": "/?v=4.2.0"       // ← Update query param
}
```

### 3. Deploy

```bash
git add public/sw.js public/manifest.json
git commit -m "chore: bump version to v4.2.0"
git push
```

---

## Version Numbering Guide

- **v5.0** - Major features, redesigns, breaking changes
- **v4.2** - New features, significant updates, bug fixes
- **v4.2.1** - Hotfixes, small tweaks

---

## After Deploy

1. Wait 5-10 minutes
2. Open app on your phone
3. Should see "Update Available" prompt
4. Test the update flow

---

## Emergency: Users Stuck on Old Version

1. **Increment version dramatically** (v4.1 → v5.0)
2. **Update both files** (sw.js and manifest.json)
3. **Redeploy**
4. Tell users to **force close and reopen** the app

On iOS: Swipe up to kill app, then reopen from home screen.

---

## Files Changed

- ✅ `public/sw.js` - Service worker with versioning
- ✅ `public/manifest.json` - PWA manifest with version
- ✅ `next.config.ts` - Cache-busting headers
- ✅ `components/pwa/update-prompt.tsx` - Auto-update prompt
- ✅ `app/layout.tsx` - Added UpdatePrompt component

---

## Current Version: v4.1.0

Next version will be: **v4.2.0** (or v5.0 for major updates)

See `PWA_CACHE_DEPLOYMENT_GUIDE.md` for full details.

