'use client'

import { useState, useEffect } from 'react'
import { useWorkoutStore } from '@/lib/store/workout-store'
import { useSettingsStore } from '@/lib/store/settings-store'
import { useSaveWorkout } from '@/lib/hooks/use-workouts'
import { useCheckAndCreatePR } from '@/lib/hooks/use-personal-records'
import { useAddXP, useUpdateStreak, useAddBadge } from '@/lib/hooks/use-gamification'
import { createClient } from '@/lib/supabase/client'
import { ExerciseSelector } from './exercise-selector'
import { ExerciseBlock } from './exercise-block'
import { RestTimer } from './rest-timer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Play, Square, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { calculateSessionDuration, formatDuration } from '@/lib/utils/calculations'
import { celebratePR } from '@/lib/utils/confetti'

interface WorkoutLoggerProps {
  userId: string
}

export function WorkoutLogger({ userId }: WorkoutLoggerProps) {
  const { activeWorkout, startWorkout, updateWorkout, addExercise, clearWorkout } = useWorkoutStore()
  const { defaultWeightUnit } = useSettingsStore()
  const { saveWorkout, loading: saving } = useSaveWorkout()
  const { checkAndCreatePR } = useCheckAndCreatePR()
  const { addXP } = useAddXP()
  const { updateStreak } = useUpdateStreak()
  const { addBadge } = useAddBadge()
  
  const [showExerciseSelector, setShowExerciseSelector] = useState(false)
  const [showEndDialog, setShowEndDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)

  // Update elapsed time
  useEffect(() => {
    if (!activeWorkout) return

    const interval = setInterval(() => {
      setElapsedTime(calculateSessionDuration(activeWorkout.startedAt, new Date()))
    }, 1000)

    return () => clearInterval(interval)
  }, [activeWorkout])

  const handleStartWorkout = () => {
    const now = new Date()
    const title = `Workout - ${now.toLocaleDateString()}`
    startWorkout(title)
  }

  const handleAddExercise = (exerciseId: string, name: string, bodyPart?: string) => {
    addExercise(exerciseId, name, bodyPart)
    setShowExerciseSelector(false)
  }

  const handleEndWorkout = async () => {
    if (!activeWorkout) return

    // Check if workout has any sets
    const totalSets = activeWorkout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
    if (totalSets === 0) {
      toast.error('Add at least one set before ending workout')
      return
    }

    setShowEndDialog(false)

    try {
      // Save workout and check for PRs
      const sessionId = await saveWorkout(userId, activeWorkout, async (exerciseId, weight, reps, weightUnit) => {
        const result = await checkAndCreatePR(userId, exerciseId, weight, reps, weightUnit)
        
        if (result.isNewPR && result.pr) {
          celebratePR()
          toast.success('🎉 New Personal Record!', {
            description: `${weight}${weightUnit} x ${reps} reps`,
          })
          // Award PR XP
          await addXP(userId, 10, 'PR achieved')
        }
      })

      console.log('Session ID received:', sessionId)
      
      if (sessionId) {
        // Calculate workout duration in minutes
        const startedAt = typeof activeWorkout.startedAt === 'string' 
          ? new Date(activeWorkout.startedAt) 
          : activeWorkout.startedAt
        const durationMinutes = (Date.now() - startedAt.getTime()) / (1000 * 60)
        
        // Calculate XP rewards
        let totalXP = 0
        
        // XP per exercise block (≥2 sets)
        activeWorkout.exercises.forEach((exercise) => {
          const workSets = exercise.sets.filter(s => !s.isWarmup)
          if (workSets.length >= 2) {
            totalXP += 5
          }
          // XP per work set
          totalXP += workSets.length
        })

        // Award XP with anti-cheat measures
        const { leveledUp, newLevel, xpAwarded, rankedUp, newRank } = await addXP(
          userId, 
          totalXP, 
          'Workout completed',
          durationMinutes
        )
        
        if (xpAwarded === 0) {
          toast.info('Workout saved! (Cooldown active or daily XP limit reached)')
        }
        
        if (leveledUp) {
          celebratePR()
          toast.success(`🎊 Level Up! You're now level ${newLevel}!`)
        }

        if (rankedUp && newRank) {
          celebratePR()
          // Get rank name from rank definition
          const supabase = createClient()
          const { data: rankDef } = await supabase
            .from('rank_definition')
            .select('name')
            .eq('code', newRank)
            .single()
          
          const rankName = rankDef?.name || newRank
          toast.success(`⭐ Rank Up! You're now ${rankName}!`, {
            duration: 5000,
          })
        }

        // Update streak
        const { currentStreak, streakIncreased } = await updateStreak(userId)
        
        if (streakIncreased) {
          toast.success(`🔥 ${currentStreak} day streak!`)
          
          // Check for streak badges
          if (currentStreak === 7) {
            await addBadge(userId, 'streak_7')
            toast.success('🏆 Badge Unlocked: 7-Day Streak')
          } else if (currentStreak === 30) {
            await addBadge(userId, 'streak_30')
            toast.success('🏆 Badge Unlocked: 30-Day Streak')
          }
        }

        toast.success('Workout saved!')
        clearWorkout()
      } else {
        console.error('No session ID returned - check database setup')
        toast.error('Failed to save workout - check console and database setup')
      }
    } catch (error) {
      console.error('Error saving workout:', error)
      toast.error('Failed to save workout: ' + (error as Error).message)
    }
  }

  if (!activeWorkout) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl text-center">Ready to Train?</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleStartWorkout}
            size="lg"
            className="w-full"
          >
            <Play className="mr-2 h-5 w-5" />
            Start Workout
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Workout Header */}
      <Card>
        <CardHeader className="space-y-4">
          <Input
            id="workout-title"
            value={activeWorkout.title || ''}
            onChange={(e) => updateWorkout({ title: e.target.value })}
            placeholder="Workout Title"
            className="text-lg font-semibold"
          />
          
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <div className="text-gray-500 text-xs">Duration</div>
              <div className="font-bold text-blue-600">{formatDuration(elapsedTime)}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Exercises</div>
              <div className="font-bold">{activeWorkout.exercises.length}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">Sets</div>
              <div className="font-bold">{activeWorkout.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => !s.isWarmup).length, 0)}</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Exercise Blocks */}
      {activeWorkout.exercises.map((exercise) => (
        <ExerciseBlock
          key={exercise.id}
          exercise={exercise}
          userId={userId}
        />
      ))}

      {/* Add Exercise Button */}
      <Button
        onClick={() => setShowExerciseSelector(true)}
        variant="outline"
        className="w-full"
        size="lg"
      >
        <Plus className="mr-2 h-5 w-5" />
        Add Exercise
      </Button>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          onClick={() => setShowEndDialog(true)}
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
          disabled={saving}
        >
          <Square className="mr-2 h-5 w-5" />
          {saving ? 'Saving...' : 'Finish Workout'}
        </Button>
        
        <Button
          onClick={() => setShowCancelDialog(true)}
          variant="ghost"
          size="sm"
          className="w-full text-gray-500 hover:text-red-600"
          disabled={saving}
        >
          Cancel Workout
        </Button>
      </div>

      {/* Exercise Selector Dialog */}
      {showExerciseSelector && (
        <ExerciseSelector
          userId={userId}
          onSelect={handleAddExercise}
          onClose={() => setShowExerciseSelector(false)}
        />
      )}

      {/* End Workout Confirmation */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finish Workout?</AlertDialogTitle>
            <AlertDialogDescription>
              Your workout will be saved and you'll earn XP and update your streak.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEndWorkout}>
              Finish & Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Workout Confirmation */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Workout?</AlertDialogTitle>
            <AlertDialogDescription>
              This will discard your current workout without saving. All logged exercises and sets will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Training</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                clearWorkout()
                setShowCancelDialog(false)
                toast.info('Workout cancelled')
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Cancel Workout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rest Timer */}
      <RestTimer />
    </div>
  )
}

