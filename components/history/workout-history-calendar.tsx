'use client'

import { useState, useMemo } from 'react'
import { useWorkoutSessions } from '@/lib/hooks/use-workouts'
import { WorkoutSessionCard } from './workout-session-card'
import { WorkoutSessionDetails } from './workout-session-details'
import { Drawer } from '@/components/ui/drawer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CustomCalendar } from './custom-calendar'
import { ExportButton } from '@/components/export/export-button'
import { 
  startOfWeek, 
  endOfWeek, 
  format, 
  parseISO, 
  startOfDay
} from 'date-fns'
import { Calendar as CalendarIcon, Clock, Dumbbell } from 'lucide-react'
import { calculateSessionDuration } from '@/lib/utils/calculations'
import { EmptyState, MetricTile, MotionList } from '@/components/ui/app-ui'
import type { WorkoutSession } from '@/lib/types'

interface WorkoutHistoryCalendarProps {
  userId: string
}

interface WeekSummary {
  weekStart: Date
  weekEnd: Date
  sessions: WorkoutSession[]
  totalMinutes: number
  daysActive: number
}

export function WorkoutHistoryCalendar({ userId }: WorkoutHistoryCalendarProps) {
  const { sessions, loading } = useWorkoutSessions(userId)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, WorkoutSession[]>()
    sessions.forEach((session) => {
      const sessionDate = parseISO(session.started_at)
      const dateKey = format(startOfDay(sessionDate), 'yyyy-MM-dd')
      if (!map.has(dateKey)) {
        map.set(dateKey, [])
      }
      map.get(dateKey)!.push(session)
    })
    return map
  }, [sessions])

  // Get sessions for selected date
  const selectedDateSessions = useMemo(() => {
    if (!selectedDate) return []
    const dateKey = format(startOfDay(selectedDate), 'yyyy-MM-dd')
    return sessionsByDate.get(dateKey) || []
  }, [selectedDate, sessionsByDate])

  // Get current week summary
  const currentWeekSummary = useMemo(() => {
    if (!selectedDate) return null
    
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
    
    const weekSessions = sessions.filter((session) => {
      const sessionDate = parseISO(session.started_at)
      return sessionDate >= weekStart && sessionDate <= weekEnd
    })

    const totalMinutes = weekSessions.reduce((sum, session) => {
      if (session.ended_at) {
        return sum + Math.round(calculateSessionDuration(session.started_at, session.ended_at) / 60)
      }
      return sum
    }, 0)

    const uniqueDays = new Set<string>()
    weekSessions.forEach((session) => {
      const sessionDate = parseISO(session.started_at)
      uniqueDays.add(format(startOfDay(sessionDate), 'yyyy-MM-dd'))
    })

    return {
      weekStart,
      weekEnd,
      sessions: weekSessions,
      totalMinutes,
      daysActive: uniqueDays.size
    } as WeekSummary
  }, [selectedDate, sessions])

  // Get dates with workouts for calendar highlighting
  const workoutDates = useMemo(() => {
    return Array.from(sessionsByDate.keys()).map(key => {
      const [year, month, day] = key.split('-').map(Number)
      return startOfDay(new Date(year, month - 1, day))
    })
  }, [sessionsByDate])

  // Get workout count for a date
  const getWorkoutCount = (date: Date) => {
    const dateKey = format(startOfDay(date), 'yyyy-MM-dd')
    return sessionsByDate.get(dateKey)?.length || 0
  }


  if (loading) {
    return (
      <div className="rounded-lg border bg-card/70 py-12 text-center text-muted-foreground">
        Loading workout history...
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="No workouts logged yet"
        description="Your completed sessions will appear here as a weekly training timeline."
      />
    )
  }


  return (
    <>
      <MotionList className="space-y-4 sm:space-y-6">
        {/* Weekly Summary Card */}
        {currentWeekSummary && (
          <Card className="border-l-4 border-l-primary shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm sm:text-base font-semibold">
                    Week of {format(currentWeekSummary.weekStart, 'MMM d')} - {format(currentWeekSummary.weekEnd, 'MMM d, yyyy')}
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Week {format(currentWeekSummary.weekStart, 'w')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {currentWeekSummary.sessions.length} {currentWeekSummary.sessions.length === 1 ? 'workout' : 'workouts'}
                  </Badge>
                  <ExportButton
                    type="weekly"
                    weekStart={currentWeekSummary.weekStart.toISOString()}
                    weekEnd={currentWeekSummary.weekEnd.toISOString()}
                    variant="ghost"
                    size="sm"
                    showLabel={false}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <MetricTile icon={Dumbbell} label="Workouts" value={currentWeekSummary.sessions.length} tone="primary" />
                <MetricTile icon={Clock} label="Minutes" value={currentWeekSummary.totalMinutes} tone="success" />
                <MetricTile icon={CalendarIcon} label="Days" value={currentWeekSummary.daysActive} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calendar */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <CustomCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              workoutDates={workoutDates}
              getWorkoutCount={getWorkoutCount}
            />
          </CardContent>
        </Card>

        {/* Selected Date Workouts */}
        {selectedDate && selectedDateSessions.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-black sm:text-lg">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
              <Badge variant="secondary" className="text-xs">
                {selectedDateSessions.length} {selectedDateSessions.length === 1 ? 'workout' : 'workouts'}
              </Badge>
            </div>
            <div className="space-y-3">
              {selectedDateSessions.map((session) => (
                <WorkoutSessionCard
                  key={session.id}
                  session={session}
                  onClick={() => setSelectedSessionId(session.id)}
                />
              ))}
            </div>
          </div>
        )}

        {selectedDate && selectedDateSessions.length === 0 && (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground sm:py-8">
              <p className="text-sm sm:text-base">No workouts on {format(selectedDate, 'MMMM d, yyyy')}</p>
            </CardContent>
          </Card>
        )}
      </MotionList>

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

