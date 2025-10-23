'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Dumbbell, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import type { WorkoutSession } from '@/lib/types'
import { calculateSessionDuration, formatDuration } from '@/lib/utils/calculations'

interface WorkoutSessionCardProps {
  session: WorkoutSession
  onClick: () => void
}

export function WorkoutSessionCard({ session, onClick }: WorkoutSessionCardProps) {
  const duration = useMemo(() => {
    if (!session.ended_at) return null
    return calculateSessionDuration(session.started_at, session.ended_at)
  }, [session])

  const startDate = new Date(session.started_at)

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            {session.title || 'Workout'}
          </CardTitle>
          {session.ended_at && (
            <Badge variant="secondary">Completed</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4 mr-2" />
            {format(startDate, 'MMM d, yyyy')}
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-2" />
            {format(startDate, 'h:mm a')}
          </div>
        </div>
        {duration && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-2">
            <TrendingUp className="h-4 w-4 mr-2" />
            Duration: {formatDuration(duration)}
          </div>
        )}
        {session.notes && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
            {session.notes}
          </p>
        )}
      </CardContent>
    </Card>
  )
}


