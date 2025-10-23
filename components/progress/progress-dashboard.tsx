'use client'

import { useState } from 'react'
import { useExercises } from '@/lib/hooks/use-exercises'
import { ExerciseCharts } from './exercise-charts'
import { PRList } from './pr-list'
import { InsightsPanel } from './insights-panel'
import { RankCard } from '@/components/ranks/rank-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ProgressDashboardProps {
  userId: string
}

export function ProgressDashboard({ userId }: ProgressDashboardProps) {
  const { exercises, loading } = useExercises(userId)
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Loading progress data...
      </div>
    )
  }

  if (exercises.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No exercises found</p>
        <p className="text-sm text-gray-400">
          Log some workouts to see your progress
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Insights Panel */}
      <InsightsPanel userId={userId} />

      {/* Rank Card */}
      <RankCard userId={userId} />

      <Card>
        <CardHeader>
          <CardTitle>Select Exercise</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedExerciseId || ''}
            onValueChange={setSelectedExerciseId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose an exercise..." />
            </SelectTrigger>
            <SelectContent>
              {exercises.map((exercise) => (
                <SelectItem key={exercise.id} value={exercise.id}>
                  {exercise.name}
                  {exercise.body_part && ` • ${exercise.body_part}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedExerciseId ? (
        <ExerciseCharts userId={userId} exerciseId={selectedExerciseId} />
      ) : (
        <Tabs defaultValue="prs" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prs">Personal Records</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>
          <TabsContent value="prs">
            <PRList userId={userId} />
          </TabsContent>
          <TabsContent value="overview">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">
                  Select an exercise above to view detailed progress charts
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

