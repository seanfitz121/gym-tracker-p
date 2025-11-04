'use client'

import { useCardioSessions } from '@/lib/hooks/use-cardio'
import { CardioSessionSummary } from './cardio-session-summary'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { CardioType } from '@/lib/types/cardio'

interface CardioHistoryProps {
  userId: string
  cardioType?: CardioType
  limit?: number
}

export function CardioHistory({ userId, cardioType, limit = 50 }: CardioHistoryProps) {
  const { sessions, loading, error } = useCardioSessions({
    cardioType,
    limit,
  })

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-red-600">
          <p>Error loading cardio history: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground mb-2">No cardio sessions yet</p>
          <p className="text-sm text-muted-foreground">
            Start logging your cardio sessions to see them here
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <CardioSessionSummary
          key={session.id}
          session={session}
        />
      ))}
    </div>
  )
}

