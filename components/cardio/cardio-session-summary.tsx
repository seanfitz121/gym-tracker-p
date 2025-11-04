'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { CardioSessionWithIntervals } from '@/lib/types/cardio'
import { formatDuration, formatPace, metersToDistance } from '@/lib/utils/cardio-calculations'
import { Calendar, Clock, Gauge, Heart, Flame, MapPin, ChevronDown, ChevronUp, Trophy } from 'lucide-react'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useCardioSessions } from '@/lib/hooks/use-cardio'
import { isPR } from '@/lib/utils/cardio-calculations'

interface CardioSessionSummaryProps {
  session: CardioSessionWithIntervals
  distanceUnit?: 'km' | 'miles'
  onExport?: () => void
  onShare?: () => void
}

export function CardioSessionSummary({ 
  session, 
  distanceUnit = 'km',
  onExport,
  onShare 
}: CardioSessionSummaryProps) {
  const [showIntervals, setShowIntervals] = useState(false)
  const [isPersonalRecord, setIsPersonalRecord] = useState(false)
  
  // Fetch previous sessions for PR detection
  const { sessions: previousSessions } = useCardioSessions({
    cardioType: session.cardio_type,
    limit: 100,
  })

  useEffect(() => {
    if (session.total_distance && session.total_distance > 0 && previousSessions.length > 0) {
      const otherSessions = previousSessions
        .filter(s => s.id !== session.id && s.total_distance && s.total_distance > 0)
        .map(s => ({
          distance: s.total_distance,
          total_duration: s.total_duration,
        }))
      
      const isRecord = isPR(
        session.total_distance,
        session.total_duration,
        otherSessions
      )
      setIsPersonalRecord(isRecord)
    }
  }, [session, previousSessions])

  const totalDistance = session.total_distance
    ? metersToDistance(session.total_distance, distanceUnit)
    : null

  const paceDisplay = session.avg_pace
    ? formatPace(session.avg_pace, `min/${distanceUnit === 'km' ? 'km' : 'mile'}`)
    : null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg capitalize">
              {session.cardio_type.replace('_', ' ')}
            </CardTitle>
            {isPersonalRecord && (
              <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                <Trophy className="h-3 w-3 mr-1" />
                PR
              </Badge>
            )}
          </div>
          <Badge variant="secondary" className="capitalize">
            {session.mode}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {format(new Date(session.created_at), 'PPP • p')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Duration</span>
            </div>
            <p className="text-lg font-bold">
              {formatDuration(session.total_duration)}
            </p>
          </div>

          {totalDistance && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-xs">Distance</span>
              </div>
              <p className="text-lg font-bold">
                {totalDistance.toFixed(2)} {distanceUnit}
              </p>
            </div>
          )}

          {paceDisplay && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Gauge className="h-4 w-4" />
                <span className="text-xs">Avg Pace</span>
              </div>
              <p className="text-lg font-bold">{paceDisplay}</p>
            </div>
          )}

          {session.calories && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Flame className="h-4 w-4" />
                <span className="text-xs">Calories</span>
              </div>
              <p className="text-lg font-bold">{session.calories}</p>
            </div>
          )}
        </div>

        {/* Heart Rate */}
        {(session.avg_hr || session.max_hr) && (
          <div className="flex items-center gap-4 text-sm">
            {session.avg_hr && (
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-muted-foreground">Avg:</span>
                <span className="font-semibold">{session.avg_hr} bpm</span>
              </div>
            )}
            {session.max_hr && (
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-700" />
                <span className="text-muted-foreground">Max:</span>
                <span className="font-semibold">{session.max_hr} bpm</span>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {session.notes && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">{session.notes}</p>
          </div>
        )}

        {/* Intervals */}
        {session.intervals && session.intervals.length > 0 && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={() => setShowIntervals(!showIntervals)}
            >
              <span className="font-medium">
                {session.intervals.length} Interval{session.intervals.length !== 1 ? 's' : ''}
              </span>
              {showIntervals ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {showIntervals && (
              <div className="space-y-2 mt-2">
                {session.intervals
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((interval) => {
                    const intervalDistance = interval.distance
                      ? metersToDistance(interval.distance, distanceUnit)
                      : null
                    const intervalPace = interval.avg_pace
                      ? formatPace(interval.avg_pace, `min/${distanceUnit === 'km' ? 'km' : 'mile'}`)
                      : null

                    return (
                      <div
                        key={interval.id}
                        className="p-3 bg-muted rounded-lg space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {interval.label || `Interval ${interval.order_index + 1}`}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatDuration(interval.duration)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {intervalDistance && (
                            <span>{intervalDistance.toFixed(2)} {distanceUnit}</span>
                          )}
                          {intervalPace && <span>{intervalPace}</span>}
                          {interval.avg_hr && (
                            <span>HR: {interval.avg_hr} bpm</span>
                          )}
                          {interval.rpe && (
                            <span>RPE: {interval.rpe}/10</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport} className="flex-1">
              Export
            </Button>
          )}
          {onShare && (
            <Button variant="outline" size="sm" onClick={onShare} className="flex-1">
              Share
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

