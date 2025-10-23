'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PremiumSubscription } from '@/lib/types/premium'
import { useUser } from './use-user'

export function usePremiumStatus() {
  const { user } = useUser()
  const [subscription, setSubscription] = useState<PremiumSubscription | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setSubscription(null)
      setIsPremium(false)
      setLoading(false)
      return
    }

    const fetchSubscription = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('premium_subscription')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching subscription:', error)
          setSubscription(null)
          setIsPremium(false)
        } else if (data) {
          setSubscription(data)
          setIsPremium(data.status === 'active' || data.status === 'trialing')
        } else {
          setSubscription(null)
          setIsPremium(false)
        }
      } catch (error) {
        console.error('Error fetching subscription:', error)
        setSubscription(null)
        setIsPremium(false)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()

    // Set up real-time subscription to subscription changes
    const supabase = createClient()
    const channel = supabase
      .channel('premium_subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'premium_subscription',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Subscription changed:', payload)
          if (payload.eventType === 'DELETE') {
            setSubscription(null)
            setIsPremium(false)
          } else {
            const newData = payload.new as PremiumSubscription
            setSubscription(newData)
            setIsPremium(newData.status === 'active' || newData.status === 'trialing')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return { subscription, isPremium, loading }
}

export function useCreateCheckoutSession() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createCheckoutSession = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/premium/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()

      if (url) {
        // Redirect to Stripe checkout
        window.location.href = url
      }
    } catch (err) {
      console.error('Create checkout session error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create checkout session')
    } finally {
      setLoading(false)
    }
  }

  return { createCheckoutSession, loading, error }
}

export function useCreatePortalSession() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPortalSession = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/premium/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()

      if (url) {
        // Redirect to Stripe customer portal
        window.location.href = url
      }
    } catch (err) {
      console.error('Create portal session error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create portal session')
    } finally {
      setLoading(false)
    }
  }

  return { createPortalSession, loading, error }
}

