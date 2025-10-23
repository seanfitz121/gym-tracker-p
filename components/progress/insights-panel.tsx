'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lightbulb } from 'lucide-react'
import { generateInsights, type WorkoutInsight } from '@/lib/utils/insights'
import { calculateEstimated1RM, calculateSetVolume } from '@/lib/utils/calculations'

interface InsightsPanelProps {
  userId: string
}

export function InsightsPanel({ userId }: InsightsPanelProps) {
  const [insights, setInsights] = useState<WorkoutInsight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWorkoutData = async () => {
      try {
        const supabase = createClient()

        // Get all sets from the last 90 days
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

        const { data: sets, error } = await supabase
          .from('set_entry')
          .select(`
            *,
            exercise:exercise(id, name, body_part),
            session:workout_session(started_at)
          `)
          .gte('created_at', ninetyDaysAgo.toISOString())
          .eq('is_warmup', false)

        if (error) {
          console.error('Error fetching workout data for insights:', error)
          return
        }

        if (!sets || sets.length === 0) {
          setInsights([])
          return
        }

        // Transform data for insights
        const workoutData = sets.map((set: any) => ({
          exerciseId: set.exercise.id,
          exerciseName: set.exercise.name,
          bodyPart: set.exercise.body_part,
          date: new Date(set.session.started_at),
          volume: calculateSetVolume(set.reps, set.weight),
          estimatedOneRM: calculateEstimated1RM(set.weight, set.reps),
          sessionId: set.workout_session_id,
        }))

        const generatedInsights = generateInsights(workoutData)
        setInsights(generatedInsights)
      } catch (err) {
        console.error('Error generating insights:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkoutData()
  }, [userId])

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500 text-sm">
            Analyzing your workouts...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Coach Yourself
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Keep logging workouts to get personalized insights!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Coach Yourself
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <InsightItem key={index} insight={insight} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function InsightItem({ insight }: { insight: WorkoutInsight }) {
  const typeStyles = {
    positive: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800',
    warning: 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800',
    neutral: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
    achievement: 'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800',
  }

  return (
    <div className={`p-3 rounded-lg border ${typeStyles[insight.type]}`}>
      <div className="flex items-start gap-2">
        <span className="text-lg flex-shrink-0">{insight.emoji}</span>
        <p className="text-sm flex-1">{insight.message}</p>
      </div>
    </div>
  )
}


