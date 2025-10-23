'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function LoadingBar() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Reset loading when pathname changes
    setIsLoading(false)
  }, [pathname])

  useEffect(() => {
    const handleNavigationStart = () => {
      setIsLoading(true)
    }

    // Listen for custom navigation event
    window.addEventListener('navigation-start', handleNavigationStart)
    return () => window.removeEventListener('navigation-start', handleNavigationStart)
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 origin-left animate-in slide-in-from-left-full duration-1000 ease-out"
        style={{
          animation: 'loadingBar 1s ease-out forwards',
        }}
      />
      <style jsx global>{`
        @keyframes loadingBar {
          0% {
            transform: scaleX(0) translateX(0);
          }
          50% {
            transform: scaleX(0.7) translateX(0);
          }
          100% {
            transform: scaleX(0.95) translateX(0);
          }
        }
      `}</style>
    </div>
  )
}

