'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Target, TrendingUp, Calendar, Trophy, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import { OneRMProgress, OneRMGoal } from '@/lib/types/one-rm'
import { Exercise } from '@/lib/types'
import { SetOneRMGoalDialog } from './set-one-rm-goal-dialog'
import { AddOneRMLiftDialog } from './add-one-rm-lift-dialog'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'

interface OneRMTrackerProps {
  userId: string
  exercises: Exercise[]
}

export function OneRMTracker({ userId, exercises }: OneRMTrackerProps) {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)
  const [lifts, setLifts] = useState<OneRMProgress[]>([])
  const [goals, setGoals] = useState<OneRMGoal[]>([])
  const [loading, setLoading] = useState(false)
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false)
  const [isAddLiftDialogOpen, setIsAddLiftDialogOpen] = useState(false)

  const fetchLifts = async (exerciseId?: string) => {
    try {
      setLoading(true)
      const url = exerciseId 
        ? `/api/one-rm/lifts?exercise_id=${exerciseId}`
        : '/api/one-rm/lifts'
      
      const res = await fetch(url)
      const data = await res.json()
      // Ensure data is an array, even if API returns an error object
      setLifts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching 1RM lifts:', error)
      setLifts([]) // Set to empty array on error
      // Don't show toast error if table doesn't exist yet
    } finally {
      setLoading(false)
    }
  }

  const fetchGoals = async () => {
    try {
      const res = await fetch('/api/one-rm/goals')
      const data = await res.json()
      // Ensure data is an array, even if API returns an error object
      setGoals(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching 1RM goals:', error)
      setGoals([]) // Set to empty array on error
    }
  }

  useEffect(() => {
    fetchLifts(selectedExerciseId || undefined)
  }, [selectedExerciseId])

  useEffect(() => {
    fetchGoals()
  }, [])

  const handleDeleteLift = async (liftId: string) => {
    if (!confirm('Are you sure you want to delete this 1RM lift?')) return

    try {
      const res = await fetch(`/api/one-rm/lifts/${liftId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete')

      toast.success('1RM lift deleted')
      fetchLifts(selectedExerciseId || undefined)
    } catch (error) {
      console.error('Error deleting lift:', error)
      toast.error('Failed to delete lift')
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return

    try {
      const res = await fetch(`/api/one-rm/goals/${goalId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete')

      toast.success('Goal deleted')
      fetchGoals()
      fetchLifts(selectedExerciseId || undefined)
    } catch (error) {
      console.error('Error deleting goal:', error)
      toast.error('Failed to delete goal')
    }
  }

  const selectedExercise = exercises.find(e => e.id === selectedExerciseId)
  const currentGoal = goals.find(g => g.exercise_id === selectedExerciseId)
  const filteredLifts = selectedExerciseId 
    ? lifts.filter(l => l.exercise_id === selectedExerciseId)
    : lifts

  // Get the latest lift for the selected exercise
  const latestLift = filteredLifts.length > 0 ? filteredLifts[0] : null

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            1RM Tracker
          </CardTitle>
          <CardDescription>
            Track your true one-rep max lifts and set goals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Exercise Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Exercise</label>
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
          </div>

          {/* Current Stats */}
          {selectedExerciseId && latestLift && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Current 1RM</div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {latestLift.weight} {latestLift.weight_unit}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {format(parseISO(latestLift.logged_at), 'MMM d, yyyy')}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
                  {currentGoal ? 'Goal Progress' : 'Goal'}
                </div>
                {currentGoal ? (
                  <>
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {latestLift.goal_progress_percent?.toFixed(0) || 0}%
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      Target: {currentGoal.target_weight} {currentGoal.weight_unit}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                    No goal set
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {selectedExerciseId && (
            <div className="flex gap-2">
              <Button
                onClick={() => setIsAddLiftDialogOpen(true)}
                className="flex-1"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add 1RM Lift
              </Button>
              <Button
                onClick={() => setIsGoalDialogOpen(true)}
                className="flex-1"
                variant="outline"
              >
                <Target className="h-4 w-4 mr-2" />
                {currentGoal ? 'Update Goal' : 'Set Goal'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lift History */}
      {selectedExerciseId && filteredLifts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lift History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredLifts.map((lift) => (
                <div
                  key={lift.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">
                        {lift.weight} {lift.weight_unit}
                      </span>
                      {lift.goal_achieved && (
                        <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-600 dark:border-green-400">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Goal Hit!
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(parseISO(lift.logged_at), 'MMM d, yyyy')}
                    </div>
                    {lift.notes && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {lift.notes}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteLift(lift.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Goal Card */}
      {selectedExerciseId && currentGoal && (
        <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Current Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {currentGoal.target_weight} {currentGoal.weight_unit}
                </div>
                {currentGoal.target_date && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    Target: {format(parseISO(currentGoal.target_date), 'MMM d, yyyy')}
                  </div>
                )}
              </div>
              {currentGoal.achieved && (
                <Badge className="bg-green-600 text-white">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Achieved!
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteGoal(currentGoal.id)}
              className="w-full text-red-600 hover:text-red-700 dark:text-red-400"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!selectedExerciseId && (
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select an exercise to track your 1RM</p>
              <p className="text-sm text-gray-400 mt-2">
                1RM lifts are automatically detected when you log a 1-rep set
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      {selectedExercise && (
        <>
          <SetOneRMGoalDialog
            open={isGoalDialogOpen}
            onOpenChange={setIsGoalDialogOpen}
            exercise={selectedExercise}
            currentGoal={currentGoal}
            onGoalSet={() => {
              fetchGoals()
              fetchLifts(selectedExerciseId || undefined)
            }}
          />
          <AddOneRMLiftDialog
            open={isAddLiftDialogOpen}
            onOpenChange={setIsAddLiftDialogOpen}
            exercise={selectedExercise}
            onLiftAdded={() => {
              fetchLifts(selectedExerciseId || undefined)
              fetchGoals()
            }}
          />
        </>
      )}
    </div>
  )
}

