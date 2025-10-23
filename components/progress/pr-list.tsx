'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy } from 'lucide-react'
import { format } from 'date-fns'

interface PRWithExercise {
  id: string
  exercise_id: string
  weight: number
  reps: number
  weight_unit: string
  estimated_1rm: number
  achieved_at: string
  exercise: {
    name: string
    body_part: string | null
  }
}

interface PRListProps {
  userId: string
}

export function PRList({ userId }: PRListProps) {
  const [prs, setPRs] = useState<PRWithExercise[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPRs = async () => {
      try {
        const supabase = createClient()

        // Get top PR for each exercise
        const { data } = await supabase
          .from('personal_record')
          .select(`
            *,
            exercise:exercise(name, body_part)
          `)
          .eq('user_id', userId)
          .order('estimated_1rm', { ascending: false })

        if (data) {
          // Group by exercise and keep only the top one
          const exerciseMap = new Map<string, PRWithExercise>()
          data.forEach((pr: any) => {
            const existing = exerciseMap.get(pr.exercise_id)
            if (!existing || pr.estimated_1rm > existing.estimated_1rm) {
              exerciseMap.set(pr.exercise_id, pr)
            }
          })

          setPRs(Array.from(exerciseMap.values()))
        }
      } catch (error) {
        console.error('Error fetching PRs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPRs()
  }, [userId])

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-gray-500">
            Loading personal records...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (prs.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No personal records yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Keep training to set your first PR!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
          Your Personal Records
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {prs.map((pr) => (
            <div
              key={pr.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex-1">
                <h3 className="font-semibold">{pr.exercise.name}</h3>
                {pr.exercise.body_part && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {pr.exercise.body_part}
                  </Badge>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(pr.achieved_at), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">
                  {pr.weight} {pr.weight_unit} × {pr.reps}
                </div>
                <div className="text-sm text-gray-500">
                  Est. 1RM: {pr.estimated_1rm?.toFixed(1)} {pr.weight_unit}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


