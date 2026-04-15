'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, Lightbulb, TrendingUp, TriangleAlert } from 'lucide-react'
import { generateInsights, type WorkoutInsight } from '@/lib/utils/insights'
import { calculateEstimated1RM, calculateSetVolume } from '@/lib/utils/calculations'

interface InsightsPanelProps {
  userId: string
}

type InsightSetRow = {
  exercise: { id: string; name: string; body_part: string | null }
  session: { started_at: string }
  reps: number
  weight: number
  session_id: string
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
            session:workout_session!inner(started_at, user_id)
          `)
          .gte('created_at', ninetyDaysAgo.toISOString())
          .eq('is_warmup', false)
          .eq('session.user_id', userId)

        if (error) {
          console.error('Error fetching workout data for insights:', error)
          return
        }

        if (!sets || sets.length === 0) {
          setInsights([])
          return
        }

        // Transform data for insights
        const workoutData = (sets as InsightSetRow[]).map((set) => ({
          exerciseId: set.exercise.id,
          exerciseName: set.exercise.name,
          bodyPart: set.exercise.body_part,
          date: new Date(set.session.started_at),
          volume: calculateSetVolume(set.reps, set.weight),
          estimatedOneRM: calculateEstimated1RM(set.weight, set.reps),
          sessionId: set.session_id,
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
    positive: 'bg-accent/10 border-accent/30',
    warning: 'bg-yellow-500/10 border-yellow-500/30',
    neutral: 'bg-secondary/70 border-border',
    achievement: 'bg-primary/10 border-primary/30',
  }
  const icons = {
    positive: TrendingUp,
    warning: TriangleAlert,
    neutral: Lightbulb,
    achievement: Award,
  }
  const Icon = icons[insight.type]

  return (
    <div className={`p-3 rounded-lg border ${typeStyles[insight.type]}`}>
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
        <p className="text-sm flex-1">{insight.message}</p>
      </div>
    </div>
  )
}


