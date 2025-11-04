'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCreateCardioSession } from '@/lib/hooks/use-cardio'
import { toast } from 'sonner'
import type { CardioType, DistanceUnit, CardioIntervalFormData } from '@/lib/types/cardio'
import { IntervalBuilder } from './interval-builder'
import type { IntervalTemplate } from '@/lib/types/cardio'
import { Card, CardContent } from '@/components/ui/card'
import { formatDuration } from '@/lib/utils/cardio-calculations'

interface ManualCardioEntryProps {
  userId: string
  onSuccess?: () => void
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

export function ManualCardioEntry({ userId, onSuccess }: ManualCardioEntryProps) {
  const { createSession, loading } = useCreateCardioSession()
  
  const [cardioType, setCardioType] = useState<CardioType>('treadmill')
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('km')
  const [durationHours, setDurationHours] = useState('0')
  const [durationMinutes, setDurationMinutes] = useState('0')
  const [durationSeconds, setDurationSeconds] = useState('0')
  const [distance, setDistance] = useState('')
  const [calories, setCalories] = useState('')
  const [avgHr, setAvgHr] = useState('')
  const [maxHr, setMaxHr] = useState('')
  const [notes, setNotes] = useState('')
  const [useIntervals, setUseIntervals] = useState(false)
  const [intervals, setIntervals] = useState<IntervalTemplate[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Convert intervals if using interval mode
    let intervalData: CardioIntervalFormData[] = []
    let totalDuration = 0

    if (useIntervals && intervals.length > 0) {
      intervalData = intervals.flatMap((interval, index) => {
        const rounds = interval.rounds || 1
        return Array.from({ length: rounds }, (_, roundIndex) => {
          const intervalDuration = interval.duration || 0
          totalDuration += intervalDuration
          return {
            label: rounds > 1 ? `${interval.label} (Round ${roundIndex + 1})` : interval.label,
            duration: intervalDuration,
            distance: interval.distance || null,
            distance_unit: distanceUnit,
            avg_pace: null,
            pace_unit: `min/${distanceUnit === 'km' ? 'km' : 'mile'}` as const,
            incline: interval.incline || null,
            resistance: interval.resistance || null,
            avg_hr: null,
            max_hr: null,
            rpe: null,
            order_index: index * rounds + roundIndex,
          }
        })
      })
    } else {
      // Calculate total duration in seconds from manual input
      totalDuration = 
        parseInt(durationHours || '0') * 3600 +
        parseInt(durationMinutes || '0') * 60 +
        parseInt(durationSeconds || '0')
    }

    if (totalDuration <= 0) {
      toast.error('Please enter a valid duration')
      return
    }

    try {

      await createSession({
        cardio_type: cardioType,
        mode: useIntervals ? 'interval' : 'manual',
        total_duration: totalDuration,
        total_distance: distance ? parseFloat(distance) : null,
        distance_unit: distanceUnit,
        avg_pace: null, // Will be calculated if distance provided
        calories: calories ? parseInt(calories) : null,
        avg_hr: avgHr ? parseInt(avgHr) : null,
        max_hr: maxHr ? parseInt(maxHr) : null,
        notes: notes || null,
        intervals: intervalData,
      })

      toast.success('Cardio session logged successfully!')
      onSuccess?.()
    } catch (error) {
      toast.error('Failed to log cardio session')
      console.error(error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs value={useIntervals ? 'intervals' : 'simple'} onValueChange={(v) => setUseIntervals(v === 'intervals')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="simple">Simple Entry</TabsTrigger>
          <TabsTrigger value="intervals">Interval Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="simple" className="space-y-4 mt-4">
          <div className="space-y-2">
        <Label htmlFor="cardio-type">Machine Type</Label>
        <Select value={cardioType} onValueChange={(value) => setCardioType(value as CardioType)}>
          <SelectTrigger id="cardio-type">
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

      <div className="space-y-2">
        <Label>Duration</Label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label htmlFor="hours" className="text-xs text-muted-foreground">Hours</Label>
            <Input
              id="hours"
              type="number"
              min="0"
              max="23"
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="minutes" className="text-xs text-muted-foreground">Minutes</Label>
            <Input
              id="minutes"
              type="number"
              min="0"
              max="59"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="seconds" className="text-xs text-muted-foreground">Seconds</Label>
            <Input
              id="seconds"
              type="number"
              min="0"
              max="59"
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="distance">Distance (optional)</Label>
          <div className="flex gap-2">
            <Input
              id="distance"
              type="number"
              step="0.01"
              min="0"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="0.00"
            />
            <Select value={distanceUnit} onValueChange={(value) => setDistanceUnit(value as DistanceUnit)}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="km">km</SelectItem>
                <SelectItem value="miles">miles</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="calories">Calories (optional)</Label>
          <Input
            id="calories"
            type="number"
            min="0"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="avg-hr">Avg HR (bpm, optional)</Label>
          <Input
            id="avg-hr"
            type="number"
            min="0"
            max="250"
            value={avgHr}
            onChange={(e) => setAvgHr(e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-hr">Max HR (bpm, optional)</Label>
          <Input
            id="max-hr"
            type="number"
            min="0"
            max="250"
            value={maxHr}
            onChange={(e) => setMaxHr(e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did you feel? Any observations?"
          rows={3}
        />
      </div>

        </TabsContent>

        <TabsContent value="intervals" className="space-y-4">
          <IntervalBuilder intervals={intervals} onChange={setIntervals} />
          
          {/* Summary stats for intervals */}
          {intervals.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Intervals:</span>
                    <span className="font-semibold">
                      {intervals.reduce((sum, i) => sum + (i.rounds || 1), 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Duration:</span>
                    <span className="font-semibold">
                      {formatDuration(intervals.reduce((sum, i) => sum + (i.duration || 0) * (i.rounds || 1), 0))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? 'Saving...' : 'Save Session'}
        </Button>
        <Button type="button" variant="outline" onClick={onSuccess} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

