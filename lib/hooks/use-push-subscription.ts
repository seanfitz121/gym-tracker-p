'use client'

import { useState, useEffect } from 'react'

export function usePushSubscription() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkSupport = () => {
        const supported = 'serviceWorker' in navigator && 'PushManager' in window
        setIsSupported(supported)
        
        if (supported && 'Notification' in window) {
          setPermission(Notification.permission)
        }
        setLoading(false)
      }

      checkSupport()

      // Check for existing subscription
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.pushManager.getSubscription().then((sub) => {
            if (sub) {
              setSubscription(sub)
            }
          })
        })
      }
    }
  }, [])

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported || !('Notification' in window)) {
      return false
    }

    if (permission === 'granted') {
      return true
    }

    const result = await Notification.requestPermission()
    setPermission(result)
    return result === 'granted'
  }

  const subscribe = async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Push notifications not supported')
      return false
    }

    const granted = await requestPermission()
    if (!granted) {
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const existingSubscription = await registration.pushManager.getSubscription()

      if (existingSubscription) {
        setSubscription(existingSubscription)
        // Save to backend
        await saveSubscription(existingSubscription)
        return true
      }

      // Get VAPID public key from environment
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        console.error('VAPID public key not configured')
        return false
      }

      // Convert VAPID key to Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey)

      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      })

      setSubscription(newSubscription)
      await saveSubscription(newSubscription)
      return true
    } catch (error) {
      console.error('Error subscribing to push:', error)
      return false
    }
  }

  const unsubscribe = async (): Promise<boolean> => {
    if (!subscription) {
      return false
    }

    try {
      await subscription.unsubscribe()

      // Delete from backend
      await fetch(`/api/notifications/push/subscribe?endpoint=${encodeURIComponent(subscription.endpoint)}`, {
        method: 'DELETE',
      })

      setSubscription(null)
      return true
    } catch (error) {
      console.error('Error unsubscribing from push:', error)
      return false
    }
  }

  const saveSubscription = async (sub: PushSubscription) => {
    const key = sub.getKey('p256dh')
    const auth = sub.getKey('auth')

    if (!key || !auth) {
      throw new Error('Invalid subscription keys')
    }

    const response = await fetch('/api/notifications/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: sub.endpoint,
        p256dh: arrayBufferToBase64(key),
        auth: arrayBufferToBase64(auth),
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to save subscription')
    }
  }

  return {
    isSupported,
    permission,
    subscription,
    loading,
    subscribe,
    unsubscribe,
    requestPermission,
  }
}

// Helper functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

