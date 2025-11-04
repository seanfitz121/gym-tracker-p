'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateCardioSession } from '@/lib/hooks/use-cardio'
import { toast } from 'sonner'
import { Play, Pause, Square, Flag } from 'lucide-react'
import { formatDuration } from '@/lib/utils/cardio-calculations'
import type { CardioType } from '@/lib/types/cardio'

interface CardioTimerProps {
  userId: string
  onComplete?: () => void
}

const CARDIO_TYPES: Array<{ value: CardioType; label: string }> = [
  { value: 'treadmill', label: 'Treadmill' },
  { value: 'bike', label: 'Stationary Bike' },
  { value: 'rower', label: 'Rower' },
  { value: 'elliptical', label: 'Elliptical' },
  { value: 'stair_climber', label: 'Stair Climber' },
  { value: 'ski_erg', label: 'Ski Erg' },
  { value: 'treadmill_incline_walk', label: 'Treadmill Incline Walk' },
  { value: 'outdoor_run', label: 'Outdoor Run' },
]

interface TimerInterval {
  id: string
  label: string
  startTime: number
  endTime?: number
  duration: number
}

export function CardioTimer({ userId, onComplete }: CardioTimerProps) {
  const { createSession, loading } = useCreateCardioSession()
  const [cardioType, setCardioType] = useState<CardioType>('treadmill')
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [currentInterval, setCurrentInterval] = useState<TimerInterval | null>(null)
  const [intervals, setIntervals] = useState<TimerInterval[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedTimeRef = useRef<number>(0)

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const elapsed = Math.floor((now - startTimeRef.current + pausedTimeRef.current) / 1000)
        setElapsedSeconds(elapsed)
      }, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isPaused])

  const handleStart = () => {
    if (!isRunning) {
      startTimeRef.current = Date.now()
      setIsRunning(true)
      setIsPaused(false)
      
      // Start new interval
      const newInterval: TimerInterval = {
        id: Date.now().toString(),
        label: intervals.length === 0 ? 'Warmup' : `Interval ${intervals.length}`,
        startTime: Date.now(),
        duration: 0,
      }
      setCurrentInterval(newInterval)
    } else if (isPaused) {
      // Resume
      const pausedDuration = Date.now() - pausedTimeRef.current
      startTimeRef.current = Date.now() - (elapsedSeconds * 1000 - pausedDuration)
      setIsPaused(false)
    }
  }

  const handlePause = () => {
    if (isRunning && !isPaused) {
      pausedTimeRef.current = Date.now()
      setIsPaused(true)
    }
  }

  const handleLap = () => {
    if (currentInterval && isRunning) {
      const endTime = Date.now()
      const duration = Math.floor((endTime - currentInterval.startTime) / 1000)
      
      const completedInterval: TimerInterval = {
        ...currentInterval,
        endTime,
        duration,
      }
      
      setIntervals([...intervals, completedInterval])
      
      // Start new interval
      const newInterval: TimerInterval = {
        id: Date.now().toString(),
        label: `Interval ${intervals.length + 1}`,
        startTime: endTime,
        duration: 0,
      }
      setCurrentInterval(newInterval)
    }
  }

  const handleStop = async () => {
    if (isRunning) {
      setIsRunning(false)
      setIsPaused(false)
      
      // Complete current interval
      if (currentInterval) {
        const endTime = Date.now()
        const duration = Math.floor((endTime - currentInterval.startTime) / 1000)
        const completedInterval: TimerInterval = {
          ...currentInterval,
          endTime,
          duration,
        }
        setIntervals([...intervals, completedInterval])
        setCurrentInterval(null)
      }

      // Save session
      try {
        // Include completed intervals plus current interval if it exists
        const allCompletedIntervals = [...intervals]
        if (currentInterval) {
          const endTime = Date.now()
          const duration = Math.floor((endTime - currentInterval.startTime) / 1000)
          allCompletedIntervals.push({
            ...currentInterval,
            endTime,
            duration,
          })
        }

        const intervalData = allCompletedIntervals.map((interval, index) => ({
          label: interval.label,
          duration: interval.duration,
          distance: null,
          distance_unit: 'km' as const,
          avg_pace: null,
          pace_unit: 'min/km' as const,
          incline: null,
          resistance: null,
          avg_hr: null,
          max_hr: null,
          rpe: null,
          order_index: index,
        }))

        await createSession({
          cardio_type: cardioType,
          mode: 'timer',
          total_duration: elapsedSeconds,
          total_distance: null,
          distance_unit: 'km',
          avg_pace: null,
          calories: null,
          avg_hr: null,
          max_hr: null,
          notes: null,
          intervals: intervalData,
        })

        toast.success('Cardio session saved!')
        onComplete?.()
      } catch (error) {
        toast.error('Failed to save session')
        console.error(error)
      }
    }
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsPaused(false)
    setElapsedSeconds(0)
    setIntervals([])
    setCurrentInterval(null)
    startTimeRef.current = 0
    pausedTimeRef.current = 0
  }

  return (
    <div className="p-6 space-y-6">
      {/* Machine Type Selector */}
      {!isRunning && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Machine Type</label>
          <Select value={cardioType} onValueChange={(value) => setCardioType(value as CardioType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CARDIO_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Timer Display */}
      <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="text-6xl sm:text-7xl font-bold tabular-nums">
              {formatDuration(elapsedSeconds)}
            </div>
            {currentInterval && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Current Interval</p>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {currentInterval.label}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Control Buttons */}
      <div className="flex gap-2">
        {!isRunning ? (
          <Button
            onClick={handleStart}
            className="flex-1"
            size="lg"
          >
            <Play className="h-5 w-5 mr-2" />
            Start
          </Button>
        ) : (
          <>
            {isPaused ? (
              <Button
                onClick={handleStart}
                className="flex-1"
                size="lg"
              >
                <Play className="h-5 w-5 mr-2" />
                Resume
              </Button>
            ) : (
              <Button
                onClick={handlePause}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </Button>
            )}
            <Button
              onClick={handleLap}
              variant="outline"
              size="lg"
            >
              <Flag className="h-5 w-5 mr-2" />
              Lap
            </Button>
            <Button
              onClick={handleStop}
              variant="destructive"
              size="lg"
              disabled={loading}
            >
              <Square className="h-5 w-5 mr-2" />
              Stop & Save
            </Button>
          </>
        )}
      </div>

      {/* Intervals List */}
      {intervals.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Intervals</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {intervals.map((interval) => (
                <div
                  key={interval.id}
                  className="flex items-center justify-between text-sm p-2 bg-muted rounded"
                >
                  <span className="font-medium">{interval.label}</span>
                  <span className="tabular-nums">{formatDuration(interval.duration)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reset Button */}
      {!isRunning && intervals.length > 0 && (
        <Button onClick={handleReset} variant="ghost" className="w-full">
          Reset
        </Button>
      )}
    </div>
  )
}

