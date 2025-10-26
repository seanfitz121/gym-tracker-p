'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

interface MilestoneBannerProps {
  milestones: string[]
}

export function MilestoneBanner({ milestones }: MilestoneBannerProps) {
  useEffect(() => {
    if (milestones.length > 0) {
      milestones.forEach((milestone, index) => {
        setTimeout(() => {
          toast.success(milestone, {
            duration: 5000,
          })
        }, index * 1000) // Stagger toasts by 1 second
      })
    }
  }, [milestones])

  return null // This component only triggers toasts
}


