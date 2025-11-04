// Service Worker for offline support
// IMPORTANT: Update this version number with each deployment to force cache refresh
const CACHE_VERSION = 'v1.3' // INCREMENT THIS ON EACH DEPLOY
const BUILD_TIMESTAMP = '2025-10-29T12:00:00Z' // Update this on each build
const CACHE_NAME = `plateprogress-${CACHE_VERSION}-${BUILD_TIMESTAMP}`
const OFFLINE_URL = '/offline.html'

const CACHE_URLS = [
  '/',
  '/app/log',
  '/app/history',
  '/app/progress',
  '/app/templates',
  '/offline.html',
]

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_URLS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      )
    })
  )
  // Force immediate control of all clients (including the current page)
  self.clients.claim()
})

// Message handler for manual update checks
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_VERSION,
      buildTimestamp: BUILD_TIMESTAMP
    })
  }
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip chrome extensions and external requests
  if (!event.request.url.startsWith(self.location.origin)) return

  const url = new URL(event.request.url)
  
  // Skip auth routes and API calls - let them go directly to network
  if (url.pathname.startsWith('/auth') || 
      url.pathname.startsWith('/api/') || 
      url.pathname.includes('supabase')) {
    return
  }

  // CRITICAL: For navigation requests (opening the app), bypass service worker completely
  // This fixes iOS Safari "Response served by service worker has redirections" error
  if (event.request.mode === 'navigate') {
    return
  }

  // Use network-first strategy for /app routes (always fetch fresh)
  const isAppRoute = url.pathname.startsWith('/app')
  
  if (isAppRoute) {
    event.respondWith(
      fetch(event.request, { redirect: 'follow' })
        .then((response) => {
          // Don't cache redirects or non-successful responses
          if (!response || response.status !== 200 || response.type === 'opaqueredirect') {
            return response
          }

          // Clone and cache the response for offline fallback
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // Fallback to cache if network fails (offline)
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL)
            }
          })
        })
    )
  } else {
    // Use cache-first for static assets (landing page, etc.)
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // Return cached response if found
        if (cachedResponse) {
          return cachedResponse
        }

        // Try network with redirect: 'follow' mode
        return fetch(event.request, { redirect: 'follow' })
          .then((response) => {
            // Don't cache redirects or non-successful responses
            if (!response || response.status !== 200 || response.type === 'opaqueredirect') {
              return response
            }

            // Clone and cache the response
            const responseToCache = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache)
            })

            return response
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL)
            }
          })
      })
    )
  }
})

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/android-chrome-192x192.png',
    badge: '/android-chrome-192x192.png',
    tag: data.tag || data.type || 'default',
    data: {
      url: data.url || '/',
      type: data.type,
      notificationId: data.notificationId,
    },
    requireInteraction: data.type === 'gym_expiry', // Critical notifications stay visible
    silent: false,
    vibrate: data.type === 'gym_expiry' ? [200, 100, 200] : [200],
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Plate Progress', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

