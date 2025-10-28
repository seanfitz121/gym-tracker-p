'use client'

import { useEffect, useRef } from 'react'
import { usePremiumStatus } from '@/lib/hooks/use-premium'

interface AdBannerProps {
  /**
   * Ad slot ID from Google AdSense
   */
  adSlot: string
  /**
   * Ad format (e.g., 'auto', 'horizontal', 'vertical', 'rectangle')
   */
  adFormat?: string
  /**
   * Ad layout (for responsive ads)
   */
  adLayout?: string
  /**
   * Custom class name
   */
  className?: string
  /**
   * Whether to show a placeholder when premium (for layout consistency)
   */
  showPlaceholder?: boolean
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export function AdBanner({
  adSlot,
  adFormat = 'auto',
  adLayout,
  className = '',
  showPlaceholder = false,
}: AdBannerProps) {
  const { isPremium, loading } = usePremiumStatus()
  const adRef = useRef<HTMLModElement>(null)
  const adPushed = useRef(false)

  useEffect(() => {
    // Don't show ads to premium users
    if (isPremium || loading) return

    // Don't push ad twice
    if (adPushed.current) return

    try {
      // Push ad to AdSense queue
      if (window.adsbygoogle && adRef.current) {
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
        adPushed.current = true
      }
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [isPremium, loading])

  // Don't render anything while loading
  if (loading) {
    return showPlaceholder ? (
      <div className={`bg-muted/30 rounded-lg animate-pulse ${className}`} style={{ minHeight: '90px' }} />
    ) : null
  }

  // Don't show ads to premium users
  if (isPremium) {
    return showPlaceholder ? (
      <div className={`bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-4 text-center ${className}`}>
        <p className="text-sm text-muted-foreground">
          ✨ Ad-free experience as a premium member
        </p>
      </div>
    ) : null
  }

  // Show ad to free users
  return (
    <div className={`ad-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout={adLayout}
        data-full-width-responsive="true"
      />
    </div>
  )
}

