'use client'

import { useEffect, useState } from 'react'
import { useWorkoutStore } from '@/lib/store/workout-store'
import { useSettingsStore } from '@/lib/store/settings-store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Timer, X } from 'lucide-react'

export function RestTimer() {
  const { restTimer, startRestTimer, stopRestTimer } = useWorkoutStore()
  const { defaultRestTimer } = useSettingsStore()
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (!restTimer.active || !restTimer.startTime) {
      return
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - restTimer.startTime!) / 1000)
      const left = Math.max(0, restTimer.duration - elapsed)
      setRemaining(left)

      if (left === 0) {
        // Play sound or vibrate
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200])
        }
        
        // Auto-stop after 0
        setTimeout(() => {
          stopRestTimer()
        }, 2000)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [restTimer, stopRestTimer])

  if (!restTimer.active) {
    return (
      <div className="fixed bottom-20 right-4 md:bottom-4 flex gap-2">
        <Button
          onClick={() => startRestTimer(30)}
          variant="secondary"
          size="sm"
        >
          <Timer className="h-4 w-4 mr-1" />
          30s
        </Button>
        <Button
          onClick={() => startRestTimer(60)}
          variant="secondary"
          size="sm"
        >
          <Timer className="h-4 w-4 mr-1" />
          60s
        </Button>
        <Button
          onClick={() => startRestTimer(90)}
          variant="secondary"
          size="sm"
        >
          <Timer className="h-4 w-4 mr-1" />
          90s
        </Button>
      </div>
    )
  }

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const isWarning = remaining <= 10 && remaining > 0
  const isDone = remaining === 0

  return (
    <Card 
      className={`fixed bottom-20 right-4 md:bottom-4 min-w-[200px] ${
        isDone ? 'bg-green-500 text-white animate-pulse' : 
        isWarning ? 'bg-orange-500 text-white' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium mb-1">
              {isDone ? 'Rest Complete!' : 'Rest Timer'}
            </div>
            <div className="text-3xl font-bold font-mono">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={stopRestTimer}
            className={isDone ? 'text-white hover:bg-green-600' : ''}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}


