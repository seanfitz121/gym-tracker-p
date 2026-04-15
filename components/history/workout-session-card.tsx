'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, TrendingUp } from 'lucide-react'
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
      className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            {session.title || 'Workout'}
          </CardTitle>
          {session.ended_at && (
            <Badge variant="secondary" className="font-bold">Completed</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            {format(startDate, 'MMM d, yyyy')}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            {format(startDate, 'h:mm a')}
          </div>
        </div>
        {duration && (
          <div className="mt-2 flex items-center text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 mr-2" />
            Duration: {formatDuration(duration)}
          </div>
        )}
        {session.notes && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {session.notes}
          </p>
        )}
      </CardContent>
    </Card>
  )
}


