'use client'

import { useState } from 'react'
import { useWorkoutSession, useDeleteWorkoutSession } from '@/lib/hooks/use-workouts'
import { useWorkoutStore } from '@/lib/store/workout-store'
import { useCreateTemplate } from '@/lib/hooks/use-templates'
import { DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { CreateTemplateDialog } from '@/components/templates/create-template-dialog'
import { Calendar, Clock, Dumbbell, Trash2, Copy, Layers, Save } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { calculateSessionDuration, formatDuration, calculateTotalVolume } from '@/lib/utils/calculations'
import type { BlockType, TemplatePayload } from '@/lib/types'

interface WorkoutSessionDetailsProps {
  sessionId: string
  onClose: () => void
  userId?: string
}

export function WorkoutSessionDetails({ sessionId, onClose, userId }: WorkoutSessionDetailsProps) {
  const { session, loading } = useWorkoutSession(sessionId)
  const { deleteSession } = useDeleteWorkoutSession()
  const { startWorkout, addExercise, addSet, addBlock, addExerciseToBlock, addSetToBlock } = useWorkoutStore()
  const { createTemplate } = useCreateTemplate()
  const [showCreateTemplateDialog, setShowCreateTemplateDialog] = useState(false)

  const handleDelete = async () => {
    const success = await deleteSession(sessionId)
    if (success) {
      toast.success('Workout deleted')
      onClose()
    } else {
      toast.error('Failed to delete workout')
    }
  }

  const handleSaveAsTemplate = async (name: string) => {
    if (!session || !userId) return

    try {
      // Separate sets by whether they belong to blocks or not
      const regularSets = session.sets.filter(set => !set.block_id)
      const blockSets = session.sets.filter(set => set.block_id)

      // Group regular sets by exercise
      const exerciseMap = new Map<string, typeof regularSets>()
      regularSets.forEach((set) => {
        const exerciseId = set.exercise.id
        if (!exerciseMap.has(exerciseId)) {
          exerciseMap.set(exerciseId, [])
        }
        exerciseMap.get(exerciseId)!.push(set)
      })

      // Build template payload
      const payload: TemplatePayload = {
        exercises: Array.from(exerciseMap.entries()).map(([exerciseId, sets]) => {
          const firstSet = sets[0]
          return {
            name: firstSet.exercise.name,
            bodyPart: firstSet.exercise.body_part || undefined,
            sets: sets.map(set => ({
              reps: set.reps,
              weight: set.weight,
              rpe: set.rpe || undefined,
            })),
          }
        }),
        blocks: session.blocks?.map(block => {
          // Group block sets by exercise
          const blockExerciseMap = new Map<string, typeof blockSets>()
          blockSets
            .filter(set => set.block_id === block.id)
            .forEach((set) => {
              const exerciseId = set.exercise.id
              if (!blockExerciseMap.has(exerciseId)) {
                blockExerciseMap.set(exerciseId, [])
              }
              blockExerciseMap.get(exerciseId)!.push(set)
            })

          return {
            blockType: block.block_type as BlockType,
            rounds: block.rounds,
            restBetweenRounds: block.rest_between_rounds,
            exercises: Array.from(blockExerciseMap.entries()).map(([exerciseId, sets]) => {
              const firstSet = sets[0]
              return {
                name: firstSet.exercise.name,
                bodyPart: firstSet.exercise.body_part || undefined,
                sets: sets
                  .filter((set, idx, arr) => {
                    // Get unique sets (one per round)
                    return arr.findIndex(s => s.round_index === set.round_index) === idx
                  })
                  .map(set => ({
                    reps: set.reps,
                    weight: set.weight,
                    rpe: set.rpe || undefined,
                  })),
              }
            }),
          }
        }),
      }

      const template = await createTemplate(userId, name, payload)
      
      if (template) {
        toast.success('Template created!')
        setShowCreateTemplateDialog(false)
      } else {
        toast.error('Failed to create template')
      }
    } catch (error) {
      console.error('Error creating template:', error)
      toast.error('Failed to create template')
    }
  }

  const handleRepeat = () => {
    if (!session) return

    // Start new workout with same structure
    startWorkout(session.title || undefined)

    // Separate sets by whether they belong to blocks or not
    const regularSets = session.sets.filter(set => !set.block_id)
    const blockSets = session.sets.filter(set => set.block_id)

    // Group regular sets by exercise
    const exerciseMap = new Map<string, typeof regularSets>()
    regularSets.forEach((set) => {
      const exerciseId = set.exercise.id
      if (!exerciseMap.has(exerciseId)) {
        exerciseMap.set(exerciseId, [])
      }
      exerciseMap.get(exerciseId)!.push(set)
    })

    // Add regular exercises and sets
    exerciseMap.forEach((sets, exerciseId) => {
      const firstSet = sets[0]
      addExercise(exerciseId, firstSet.exercise.name, firstSet.exercise.body_part || undefined)

      sets.forEach((set) => {
        addSet(exerciseId, {
          reps: set.reps,
          weight: set.weight,
          weightUnit: set.weight_unit,
          rpe: set.rpe || undefined,
          isWarmup: set.is_warmup || false,
        })
      })
    })

    // Recreate blocks
    if (session.blocks) {
      session.blocks.forEach((block) => {
        const blockId = addBlock(
          block.block_type as BlockType,
          block.rounds,
          block.rest_between_rounds
        )

        // Group block sets by exercise
        const blockExerciseMap = new Map<string, typeof blockSets>()
        blockSets
          .filter(set => set.block_id === block.id)
          .forEach((set) => {
            const exerciseId = set.exercise.id
            if (!blockExerciseMap.has(exerciseId)) {
              blockExerciseMap.set(exerciseId, [])
            }
            blockExerciseMap.get(exerciseId)!.push(set)
          })

        // Add exercises to block
        blockExerciseMap.forEach((sets, exerciseId) => {
          const firstSet = sets[0]
          addExerciseToBlock(
            blockId,
            exerciseId,
            firstSet.exercise.name,
            firstSet.exercise.body_part || undefined
          )

          // Add sets
          sets.forEach((set) => {
            addSetToBlock(blockId, exerciseId, set.round_index || 1, {
              reps: set.reps,
              weight: set.weight,
              weightUnit: set.weight_unit,
              rpe: set.rpe || undefined,
              isWarmup: set.is_warmup || false,
              isDropStep: set.is_drop_step || false,
              dropOrder: set.drop_order || undefined,
            })
          })
        })
      })
    }

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

  // Separate regular exercises from block exercises
  const regularSets = session.sets.filter(set => !set.block_id)
  const blockSets = session.sets.filter(set => set.block_id)

  // Group regular sets by exercise
  const exerciseGroups = new Map<string, typeof regularSets>()
  regularSets.forEach((set) => {
    const exerciseId = set.exercise.id
    if (!exerciseGroups.has(exerciseId)) {
      exerciseGroups.set(exerciseId, [])
    }
    exerciseGroups.get(exerciseId)!.push(set)
  })

  const BLOCK_TYPE_LABELS: Record<string, { label: string; color: string }> = {
    superset: { label: 'Superset', color: 'bg-purple-500' },
    triset: { label: 'Tri-Set', color: 'bg-indigo-500' },
    giant: { label: 'Giant Set', color: 'bg-blue-500' },
    drop: { label: 'Drop Set', color: 'bg-orange-500' },
  }

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
          {/* Blocks */}
          {session.blocks?.map((block) => {
            const blockInfo = BLOCK_TYPE_LABELS[block.block_type] || { label: block.block_type, color: 'bg-gray-500' }
            const blockExerciseSets = blockSets.filter(set => set.block_id === block.id)
            
            // Group block sets by exercise
            const blockExerciseGroups = new Map<string, typeof blockExerciseSets>()
            blockExerciseSets.forEach((set) => {
              const exerciseId = set.exercise.id
              if (!blockExerciseGroups.has(exerciseId)) {
                blockExerciseGroups.set(exerciseId, [])
              }
              blockExerciseGroups.get(exerciseId)!.push(set)
            })

            return (
              <div key={block.id} className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  <Badge className={`${blockInfo.color} text-white`}>
                    {blockInfo.label}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {block.rounds} rounds
                  </span>
                </div>

                {Array.from(blockExerciseGroups.entries()).map(([exerciseId, sets]) => {
                  const exercise = sets[0].exercise

                  return (
                    <div key={exerciseId} className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-sm">{exercise.name}</h3>
                          {exercise.body_part && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {exercise.body_part}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        {sets.map((set) => (
                          <div
                            key={set.id}
                            className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded"
                          >
                            <span className="text-gray-500">Round {set.round_index}</span>
                            <div className="flex items-center gap-3">
                              <span>
                                {set.weight} {set.weight_unit} × {set.reps} reps
                              </span>
                              {set.rpe && (
                                <Badge variant="outline" className="text-xs">
                                  RPE {set.rpe}
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
            )
          })}

          {/* Regular exercises */}
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
        <div className="space-y-2 pt-4">
          <div className="flex gap-2">
            <Button
              onClick={handleRepeat}
              variant="default"
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-2" />
              Repeat Workout
            </Button>
            {userId && (
              <Button
                onClick={() => setShowCreateTemplateDialog(true)}
                variant="outline"
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Template
              </Button>
            )}
          </div>
          <div className="flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Workout
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
      </div>

      {/* Create Template Dialog */}
      <CreateTemplateDialog
        open={showCreateTemplateDialog}
        onOpenChange={setShowCreateTemplateDialog}
        onSubmit={handleSaveAsTemplate}
      />
    </DrawerContent>
  )
}


