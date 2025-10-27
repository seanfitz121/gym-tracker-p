'use client'

import { useState, useMemo } from 'react'
import { useWorkoutSessions } from '@/lib/hooks/use-workouts'
import { WorkoutSessionCard } from './workout-session-card'
import { WorkoutSessionDetails } from './workout-session-details'
import { Drawer } from '@/components/ui/drawer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { startOfWeek, endOfWeek, format, isSameWeek, isSameDay, parseISO } from 'date-fns'
import { Calendar, Clock, Dumbbell } from 'lucide-react'
import { calculateSessionDuration } from '@/lib/utils/calculations'
import type { WorkoutSession } from '@/lib/types'

interface WorkoutHistoryProps {
  userId: string
}

interface WeekGroup {
  weekStart: Date
  weekEnd: Date
  sessions: WorkoutSession[]
}

interface DayGroup {
  date: Date
  sessions: WorkoutSession[]
}

function groupSessionsByWeek(sessions: WorkoutSession[]): WeekGroup[] {
  const weekMap = new Map<string, WeekGroup>()

  sessions.forEach((session) => {
    const sessionDate = parseISO(session.started_at)
    const weekStart = startOfWeek(sessionDate, { weekStartsOn: 1 }) // Monday start
    const weekEnd = endOfWeek(sessionDate, { weekStartsOn: 1 })
    const weekKey = weekStart.toISOString()

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, {
        weekStart,
        weekEnd,
        sessions: [],
      })
    }

    weekMap.get(weekKey)!.sessions.push(session)
  })

  // Sort weeks by most recent first
  return Array.from(weekMap.values()).sort(
    (a, b) => b.weekStart.getTime() - a.weekStart.getTime()
  )
}

function groupSessionsByDay(sessions: WorkoutSession[]): DayGroup[] {
  const dayMap = new Map<string, DayGroup>()

  sessions.forEach((session) => {
    const sessionDate = parseISO(session.started_at)
    const dayKey = format(sessionDate, 'yyyy-MM-dd')

    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, {
        date: sessionDate,
        sessions: [],
      })
    }

    dayMap.get(dayKey)!.sessions.push(session)
  })

  // Sort days by most recent first
  return Array.from(dayMap.values()).sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  )
}

export function WorkoutHistory({ userId }: WorkoutHistoryProps) {
  const { sessions, loading } = useWorkoutSessions(userId)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  const weekGroups = useMemo(() => groupSessionsByWeek(sessions), [sessions])

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Loading workout history...
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No workouts logged yet</p>
        <p className="text-sm text-gray-400">
          Your workout history will appear here
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-8">
        {weekGroups.map((week) => {
          const dayGroups = groupSessionsByDay(week.sessions)
          const totalMinutes = week.sessions.reduce((sum, session) => {
            if (session.ended_at) {
              return sum + Math.round(calculateSessionDuration(session.started_at, session.ended_at) / 60)
            }
            return sum
          }, 0)

          return (
            <div key={week.weekStart.toISOString()} className="space-y-4">
              {/* Week Header */}
              <Card className="border-l-4 border-l-blue-600">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {format(week.weekStart, 'MMM d')} - {format(week.weekEnd, 'MMM d, yyyy')}
                      </CardTitle>
                      <p className="text-xs text-gray-500 mt-1">
                        Week {format(week.weekStart, 'w')}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {week.sessions.length} {week.sessions.length === 1 ? 'workout' : 'workouts'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1 text-gray-500">
                        <Dumbbell className="h-3 w-3" />
                        <span className="text-xs">Workouts</span>
                      </div>
                      <p className="text-lg font-bold text-blue-600">{week.sessions.length}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1 text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs">Minutes</span>
                      </div>
                      <p className="text-lg font-bold text-green-600">{totalMinutes}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1 text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs">Days Active</span>
                      </div>
                      <p className="text-lg font-bold text-purple-600">{dayGroups.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Days within the week */}
              <div className="space-y-6 pl-4">
                {dayGroups.map((day) => (
                  <div key={day.date.toISOString()} className="space-y-3">
                    {/* Day Header */}
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-gray-200" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {format(day.date, 'EEEE, MMM d')}
                      </span>
                      <div className="h-px flex-1 bg-gray-200" />
                    </div>

                    {/* Sessions for this day */}
                    <div className="space-y-3">
                      {day.sessions.map((session) => (
                        <WorkoutSessionCard
                          key={session.id}
                          session={session}
                          onClick={() => setSelectedSessionId(session.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {selectedSessionId && (
        <Drawer open={!!selectedSessionId} onOpenChange={() => setSelectedSessionId(null)}>
          <WorkoutSessionDetails
            sessionId={selectedSessionId}
            onClose={() => setSelectedSessionId(null)}
            userId={userId}
          />
        </Drawer>
      )}
    </>
  )
}

