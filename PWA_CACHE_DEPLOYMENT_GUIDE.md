# PWA Cache Busting & Deployment Guide

## 🔧 Problem Solved

iOS and other mobile browsers **aggressively cache** Progressive Web Apps (PWAs) added to the home screen. This means users on old bookmarks could be stuck on outdated versions even after you deploy updates.

## ✅ Solutions Implemented

### 1. Service Worker Versioning (`public/sw.js`)

The service worker now uses a **versioned cache name** that must be updated on each deployment:

```javascript
const CACHE_VERSION = 'v4.1' // INCREMENT THIS ON EACH DEPLOY
const BUILD_TIMESTAMP = '2025-01-26T12:00:00Z' // Update this on each build
const CACHE_NAME = `plateprogress-${CACHE_VERSION}-${BUILD_TIMESTAMP}`
```

**When you deploy**, the new service worker with a different cache name will:
1. Install alongside the old one
2. Delete old caches (via the `activate` event)
3. Force clients to use the new version

### 2. Aggressive Cache-Busting Headers (`next.config.ts`)

Updated headers for different asset types:

- **Service Worker** (`/sw.js`): No caching (`max-age=0, no-cache`)
- **Manifest** (`/manifest.json`): 1 hour cache with revalidation
- **Static Assets** (images, logos): 1 day cache with stale-while-revalidate
- **API Routes**: No caching at all

This ensures browsers always check for fresh versions.

### 3. Auto-Update Detection (`components/pwa/update-prompt.tsx`)

A new component that:
- Checks for service worker updates every 5 minutes
- Shows a friendly prompt when an update is available
- Allows users to update immediately or dismiss
- Auto-reloads the page when the new service worker activates

The prompt appears at the bottom of the screen (above the navbar on mobile).

### 4. Manifest Versioning (`public/manifest.json`)

Added version tracking:
```json
{
  "version": "4.1.0",
  "start_url": "/?v=4.1.0"
}
```

The query parameter in `start_url` helps iOS recognize it as a different version.

---

## 📋 Deployment Checklist

**Every time you deploy a new version:**

### Step 1: Update Service Worker Version
Edit `public/sw.js`:

```javascript
const CACHE_VERSION = 'v4.2' // Increment the version number
const BUILD_TIMESTAMP = '2025-01-26T15:30:00Z' // Update to current timestamp
```

**Versioning scheme:**
- Major UI changes or features: `v5.0`
- Minor features or bug fixes: `v4.2`
- Hotfixes: `v4.2.1`

### Step 2: Update Manifest Version
Edit `public/manifest.json`:

```json
{
  "version": "4.2.0",
  "start_url": "/?v=4.2.0"
}
```

### Step 3: Commit and Deploy
```bash
git add public/sw.js public/manifest.json
git commit -m "chore: bump version to v4.2.0"
git push
```

### Step 4: Verify After Deploy

1. Open your deployed site in a **fresh incognito window**
2. Open DevTools > Application > Service Workers
3. Verify the new service worker is installed
4. Check Application > Cache Storage - should see new cache name
5. Old caches should be automatically deleted

---

## 🧪 Testing Cache Updates

### Test in iOS Safari (Home Screen App)

1. **Before deploying:**
   - Add app to home screen on iOS
   - Note the current version/UI

2. **After deploying:**
   - Open the home screen app
   - You should see the "Update Available" prompt within ~5 minutes
   - Click "Update Now"
   - App should reload with new version

### Test in Chrome/Android

1. Open DevTools > Application > Service Workers
2. Check "Update on reload"
3. Refresh the page
4. Verify new service worker installs
5. Old cache should be deleted

### Force Update (Emergency)

If users are stuck on an old version, you can:

1. **Increment version dramatically** (e.g., `v4.1` → `v5.0`)
2. **Change cache strategy** (in service worker)
3. **Users must manually refresh** or wait for auto-check

---

## 🚨 Common Issues & Solutions

### Issue: "Users still seeing old version after deploy"

**Likely causes:**
- Forgot to update `CACHE_VERSION` or `BUILD_TIMESTAMP`
- User hasn't opened the app in >5 minutes (auto-check interval)
- Service worker failed to update (check DevTools errors)

**Fix:**
1. Verify `sw.js` has new version number
2. Tell users to **force close and reopen** the app
3. On iOS: Swipe up to kill the app, then reopen

### Issue: "Update prompt not showing"

**Likely causes:**
- Service worker registration failed
- Browser doesn't support service workers
- Update check interval hasn't passed yet

**Fix:**
1. Check console for errors
2. Verify `navigator.serviceWorker` exists
3. Manually trigger check via DevTools

### Issue: "iOS Safari not updating"

**iOS is particularly stubborn:**
- May require **full app reinstall** in extreme cases
- Try: Delete app → Clear Safari cache → Re-add to home screen

**Better prevention:**
- Always increment versions with each deploy
- Use distinct version numbers (never reuse)
- Test on real iOS device after major updates

---

## 💡 Best Practices

### 1. Version Numbering
Use semantic versioning:
- **Major (v5.0)**: Breaking changes, major redesigns
- **Minor (v4.2)**: New features, significant updates
- **Patch (v4.2.1)**: Bug fixes, small tweaks

### 2. Build Timestamp
Update timestamp for **every single deploy**, even if version doesn't change:
```javascript
const BUILD_TIMESTAMP = new Date().toISOString()
```

Consider automating this with a build script.

### 3. Changelog
Maintain `CHANGELOG.md` to track what changed in each version:
```markdown
## v4.2.0 (2025-01-26)
- Added hydration tracker
- Fixed logo caching issue
- Improved iOS PWA updates
```

### 4. Communicate Updates
Use the **Patch Notes** feature to inform users about major updates:
- New features
- Bug fixes
- Performance improvements

### 5. Monitoring
Watch for:
- Service worker registration failures
- Cache size (shouldn't exceed 50MB)
- Update prompt acceptance rate

---

## 🔄 Automated Version Bumping (Optional)

Create `scripts/bump-version.js`:

```javascript
const fs = require('fs')
const path = require('path')

// Read current version from manifest
const manifestPath = path.join(__dirname, '../public/manifest.json')
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

// Increment patch version
const [major, minor, patch] = manifest.version.split('.').map(Number)
const newVersion = `${major}.${minor}.${patch + 1}`
const timestamp = new Date().toISOString()

// Update manifest
manifest.version = newVersion
manifest.start_url = `/?v=${newVersion}`
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))

// Update service worker
const swPath = path.join(__dirname, '../public/sw.js')
let swContent = fs.readFileSync(swPath, 'utf8')
swContent = swContent.replace(
  /const CACHE_VERSION = 'v[\d.]+'/,
  `const CACHE_VERSION = 'v${newVersion}'`
)
swContent = swContent.replace(
  /const BUILD_TIMESTAMP = '[^']+'/,
  `const BUILD_TIMESTAMP = '${timestamp}'`
)
fs.writeFileSync(swPath, swContent)

console.log(`✅ Bumped version to ${newVersion}`)
console.log(`✅ Updated timestamp to ${timestamp}`)
```

Add to `package.json`:
```json
{
  "scripts": {
    "bump": "node scripts/bump-version.js"
  }
}
```

Run before deploying:
```bash
npm run bump
git add .
git commit -m "chore: bump version"
git push
```

---

## 📱 User Experience

### What Users See

1. **Fresh install**: Latest version immediately
2. **Existing users**: 
   - App works normally
   - After ~5 minutes, "Update Available" prompt appears
   - User can update now or later
   - After update: Immediate reload with new version

### Update Frequency

- **Auto-check**: Every 5 minutes while app is open
- **Manual check**: On app launch (service worker `.update()`)
- **Browser check**: Varies by browser (Chrome ~24hrs, iOS Safari ~7 days)

---

## ✅ Summary

**You now have:**
1. ✅ Versioned service worker that forces cache updates
2. ✅ Aggressive cache-busting headers for static assets
3. ✅ Auto-update detection with user-friendly prompt
4. ✅ Versioned manifest for better iOS compatibility

**On each deploy, just:**
1. Increment `CACHE_VERSION` in `sw.js`
2. Update `BUILD_TIMESTAMP` in `sw.js`
3. Update `version` and `start_url` in `manifest.json`
4. Deploy!

Users will automatically receive the update within ~5 minutes, or immediately if they manually refresh.

---

## 🔗 Resources

- [Service Worker Lifecycle](https://web.dev/service-worker-lifecycle/)
- [PWA Caching Strategies](https://web.dev/offline-cookbook/)
- [iOS Safari PWA Gotchas](https://firt.dev/pwa-2021/#ios-and-ipados)
- [Cache-Control Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)

