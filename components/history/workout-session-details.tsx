'use client'

import { useWorkoutSession, useDeleteWorkoutSession } from '@/lib/hooks/use-workouts'
import { useWorkoutStore } from '@/lib/store/workout-store'
import { DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Calendar, Clock, Dumbbell, Trash2, Copy } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { calculateSessionDuration, formatDuration, calculateTotalVolume } from '@/lib/utils/calculations'

interface WorkoutSessionDetailsProps {
  sessionId: string
  onClose: () => void
}

export function WorkoutSessionDetails({ sessionId, onClose }: WorkoutSessionDetailsProps) {
  const { session, loading } = useWorkoutSession(sessionId)
  const { deleteSession } = useDeleteWorkoutSession()
  const { startWorkout, addExercise, addSet } = useWorkoutStore()

  const handleDelete = async () => {
    const success = await deleteSession(sessionId)
    if (success) {
      toast.success('Workout deleted')
      onClose()
    } else {
      toast.error('Failed to delete workout')
    }
  }

  const handleRepeat = () => {
    if (!session) return

    // Start new workout with same structure
    startWorkout(session.title || undefined)

    // Group sets by exercise
    const exerciseMap = new Map<string, typeof session.sets>()
    session.sets.forEach((set) => {
      const exerciseId = set.exercise.id
      if (!exerciseMap.has(exerciseId)) {
        exerciseMap.set(exerciseId, [])
      }
      exerciseMap.get(exerciseId)!.push(set)
    })

    // Add exercises and sets
    exerciseMap.forEach((sets, exerciseId) => {
      const firstSet = sets[0]
      addExercise(exerciseId, firstSet.exercise.name, firstSet.exercise.body_part || undefined)

      sets.forEach((set) => {
        addSet(exerciseId, {
          reps: set.reps,
          weight: set.weight,
          weightUnit: set.weight_unit,
          rpe: set.rpe || undefined,
          isWarmup: set.is_warmup,
        })
      })
    })

    toast.success('Workout template loaded')
    onClose()
  }

  if (loading) {
    return (
      <DrawerContent>
        <div className="p-8 text-center text-gray-500">Loading...</div>
      </DrawerContent>
    )
  }

  if (!session) {
    return (
      <DrawerContent>
        <div className="p-8 text-center text-gray-500">Workout not found</div>
      </DrawerContent>
    )
  }

  const duration = session.ended_at
    ? calculateSessionDuration(session.started_at, session.ended_at)
    : null

  // Group sets by exercise
  const exerciseGroups = new Map<string, typeof session.sets>()
  session.sets.forEach((set) => {
    const exerciseId = set.exercise.id
    if (!exerciseGroups.has(exerciseId)) {
      exerciseGroups.set(exerciseId, [])
    }
    exerciseGroups.get(exerciseId)!.push(set)
  })

  return (
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>{session.title || 'Workout'}</DrawerTitle>
        <DrawerDescription>
          {format(new Date(session.started_at), 'MMMM d, yyyy • h:mm a')}
        </DrawerDescription>
      </DrawerHeader>
      <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          {duration && (
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              <span>{formatDuration(duration)}</span>
            </div>
          )}
          <div className="flex items-center text-sm">
            <Dumbbell className="h-4 w-4 mr-2 text-gray-500" />
            <span>{exerciseGroups.size} exercises</span>
          </div>
        </div>

        {session.notes && (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">{session.notes}</p>
          </div>
        )}

        <Separator />

        {/* Exercises */}
        <div className="space-y-4">
          {Array.from(exerciseGroups.entries()).map(([exerciseId, sets]) => {
            const exercise = sets[0].exercise
            const totalVolume = calculateTotalVolume(sets)

            return (
              <div key={exerciseId} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{exercise.name}</h3>
                    {exercise.body_part && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {exercise.body_part}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {totalVolume.toFixed(0)} {sets[0].weight_unit} volume
                  </div>
                </div>
                <div className="space-y-1">
                  {sets.map((set, idx) => (
                    <div
                      key={set.id}
                      className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded"
                    >
                      <span className="text-gray-500">Set {idx + 1}</span>
                      <div className="flex items-center gap-3">
                        <span>
                          {set.weight} {set.weight_unit} × {set.reps} reps
                        </span>
                        {set.rpe && (
                          <Badge variant="outline" className="text-xs">
                            RPE {set.rpe}
                          </Badge>
                        )}
                        {set.is_warmup && (
                          <Badge variant="secondary" className="text-xs">
                            Warmup
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleRepeat}
            variant="default"
            className="flex-1"
          >
            <Copy className="h-4 w-4 mr-2" />
            Repeat Workout
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Workout?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this workout session.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </DrawerContent>
  )
}


