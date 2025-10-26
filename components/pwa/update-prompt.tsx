'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, RefreshCw } from 'lucide-react'

export function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    // Check for service worker updates every 5 minutes
    const checkForUpdates = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration()
        if (reg) {
          await reg.update()
        }
      } catch (error) {
        console.log('Service worker update check failed:', error)
      }
    }

    // Initial check
    checkForUpdates()

    // Periodic checks
    const interval = setInterval(checkForUpdates, 5 * 60 * 1000) // Every 5 minutes

    // Listen for service worker updates
    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg)

      // Check if there's a waiting service worker
      if (reg.waiting) {
        setShowPrompt(true)
      }

      // Listen for new service worker installing
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is available
              setShowPrompt(true)
            }
          })
        }
      })
    })

    // Listen for controller change (new service worker activated)
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true
        window.location.reload()
      }
    })

    return () => {
      clearInterval(interval)
    }
  }, [])

  const handleUpdate = () => {
    if (!registration?.waiting) {
      // If no waiting worker, just reload
      window.location.reload()
      return
    }

    // Tell the waiting service worker to skip waiting
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    
    // The page will automatically reload via the controllerchange event
  }

  const handleDismiss = () => {
    setShowPrompt(false)
  }

  if (!showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 animate-in slide-in-from-bottom-5">
      <Card className="border-2 border-blue-500 bg-background shadow-2xl">
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-500" />
                Update Available
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                A new version of Plate Progress is ready. Refresh to get the latest features and fixes.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-8 w-8 shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleUpdate}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Now
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
            >
              Later
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

