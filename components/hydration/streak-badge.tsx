'use client'

import { Badge } from '@/components/ui/badge'
import { Flame } from 'lucide-react'

interface StreakBadgeProps {
  streak: number
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak === 0) return null

  const isPulsing = streak > 7

  return (
    <div className="flex items-center justify-center gap-2">
      <Badge 
        variant="outline" 
        className={`text-lg px-4 py-2 border-orange-500 text-orange-600 dark:text-orange-400 ${
          isPulsing ? 'animate-pulse' : ''
        }`}
      >
        <Flame className="h-5 w-5 mr-2 fill-orange-500" />
        <span className="font-bold">{streak} day{streak !== 1 ? 's' : ''}</span>
        <span className="ml-1 font-normal">streak!</span>
      </Badge>
    </div>
  )
}


