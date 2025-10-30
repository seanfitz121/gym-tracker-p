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
import { BlockCard } from './block-card'
import { CreateBlockDialog } from './create-block-dialog'
import { RestTimer } from './rest-timer'
import { TemplatesDropdown } from '@/components/templates/templates-dropdown'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Play, Square, Plus, Layers, Dumbbell, Target, Timer, TrendingUp, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { calculateSessionDuration, formatDuration } from '@/lib/utils/calculations'
import { celebratePR } from '@/lib/utils/confetti'
import { playStartSound, playCelebrationSound } from '@/lib/utils/sounds'
import type { BlockType } from '@/lib/types'

interface WorkoutLoggerProps {
  userId: string
}

export function WorkoutLogger({ userId }: WorkoutLoggerProps) {
  const { activeWorkout, startWorkout, updateWorkout, addExercise, addBlock, clearWorkout } = useWorkoutStore()
  const { defaultWeightUnit } = useSettingsStore()
  const { saveWorkout, loading: saving } = useSaveWorkout()
  const { checkAndCreatePR } = useCheckAndCreatePR()
  const { addXP } = useAddXP()
  const { updateStreak } = useUpdateStreak()
  const { addBadge } = useAddBadge()
  
  const [showExerciseSelector, setShowExerciseSelector] = useState(false)
  const [showCreateBlockDialog, setShowCreateBlockDialog] = useState(false)
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
    playStartSound()
    const now = new Date()
    const title = `Workout - ${now.toLocaleDateString()}`
    startWorkout(title)
  }

  const handleAddExercise = (exerciseId: string, name: string, bodyPart?: string) => {
    addExercise(exerciseId, name, bodyPart)
    setShowExerciseSelector(false)
  }

  const handleCreateBlock = (blockType: BlockType, rounds: number, restBetweenRounds: number) => {
    addBlock(blockType, rounds, restBetweenRounds)
    toast.success('Block created! Add exercises to get started')
  }

  const handleEndWorkout = async () => {
    if (!activeWorkout) return

    // Check if workout has any sets (including blocks)
    const totalSets = activeWorkout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0) +
                      activeWorkout.blocks.reduce((sum, block) => sum + block.exercises.reduce((exSum, ex) => exSum + ex.sets.length, 0), 0)
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
        
        // XP from blocks (supersets/drop-sets)
        activeWorkout.blocks.forEach((block) => {
          // Bonus XP for completing blocks
          totalXP += 10 // Bonus for using advanced training methods
          
          block.exercises.forEach((exercise) => {
            const workSets = exercise.sets.filter(s => !s.isWarmup)
            totalXP += workSets.length
          })
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
        
        // Play celebration sound for workout completion
        playCelebrationSound()
        
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
      <div className="w-full space-y-4">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 sm:p-8 shadow-xl">
          {/* Animated background pattern */}
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
          
          <div className="relative z-10 text-center text-white space-y-3">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Dumbbell className="h-7 w-7" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Ready to Train?
            </h1>
            <p className="text-blue-100 text-sm max-w-md mx-auto">
              Start your workout and track every rep, set, and PR. Let's make today count! 💪
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid gap-3">
          <button
            onClick={handleStartWorkout}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-white/20 to-green-400/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            <div className="relative flex items-center justify-center gap-3 text-white">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/30 backdrop-blur-sm border border-white/40 shadow-lg">
                <Play className="h-6 w-6 fill-white drop-shadow-md" />
              </div>
              <div className="text-left">
                <div className="text-lg font-bold drop-shadow-md [text-shadow:_0_1px_3px_rgb(0_0_0_/_40%)]">Start Empty Workout</div>
                <div className="text-xs text-green-50 drop-shadow-sm [text-shadow:_0_1px_2px_rgb(0_0_0_/_30%)]">Build your session from scratch</div>
              </div>
            </div>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center px-4">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gray-50 dark:bg-gray-900 px-3 py-1 text-xs font-medium text-gray-500 uppercase rounded-full">
                Or use a template
              </span>
            </div>
          </div>

          <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-4">
            <TemplatesDropdown userId={userId} />
          </div>
        </div>

        {/* Quick Tips */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-900">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                  <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Pro Tip</h3>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Log at least 2 work sets per exercise to maximize your XP gains and track your progress effectively!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Workout Header */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-950 border border-blue-200 dark:border-blue-900 shadow-lg p-4 sm:p-6">
          {/* Workout Title */}
          <div className="mb-3">
            <Input
              id="workout-title"
              value={activeWorkout.title || ''}
              onChange={(e) => updateWorkout({ title: e.target.value })}
              placeholder="Workout Title"
              className="text-xl font-bold border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
            />
          </div>

          {/* Workout Notes */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <Label htmlFor="workout-notes" className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Notes (optional)
              </Label>
            </div>
            <Textarea
              id="workout-notes"
              value={activeWorkout.notes || ''}
              onChange={(e) => updateWorkout({ notes: e.target.value })}
              placeholder="Add notes about your workout (e.g., how you felt, what worked well, adjustments made...)"
              className="min-h-[80px] resize-none text-sm"
            />
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 p-4 border border-blue-100 dark:border-blue-900">
              <div className="flex flex-col items-center gap-1">
                <Timer className="h-5 w-5 text-blue-600 dark:text-blue-400 mb-1" />
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 tabular-nums">
                  {formatDuration(elapsedTime)}
                </div>
                <div className="text-xs font-medium text-blue-600/70 dark:text-blue-400/70 uppercase tracking-wide">
                  Duration
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 p-4 border border-purple-100 dark:border-purple-900">
              <div className="flex flex-col items-center gap-1">
                <Dumbbell className="h-5 w-5 text-purple-600 dark:text-purple-400 mb-1" />
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {activeWorkout.exercises.length + activeWorkout.blocks.reduce((sum, block) => sum + block.exercises.length, 0)}
                </div>
                <div className="text-xs font-medium text-purple-600/70 dark:text-purple-400/70 uppercase tracking-wide">
                  Exercises
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 p-4 border border-emerald-100 dark:border-emerald-900">
              <div className="flex flex-col items-center gap-1">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mb-1" />
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  {activeWorkout.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => !s.isWarmup).length, 0) +
                   activeWorkout.blocks.reduce((sum, block) => sum + block.exercises.reduce((exSum, ex) => exSum + ex.sets.filter(s => !s.isWarmup).length, 0), 0)}
                </div>
                <div className="text-xs font-medium text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wide">
                  Sets
                </div>
              </div>
            </div>
          </div>
      </div>

      {/* Blocks (Supersets/Drop-sets) */}
      {activeWorkout.blocks.map((block) => (
        <BlockCard
          key={block.id}
          block={block}
          userId={userId}
        />
      ))}

      {/* Regular Exercise Blocks */}
      {activeWorkout.exercises.map((exercise) => (
        <ExerciseBlock
          key={exercise.id}
          exercise={exercise}
          userId={userId}
        />
      ))}

      {/* Add Exercise/Block Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowExerciseSelector(true)}
          className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-4 shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] touch-manipulation"
        >
          <div className="flex flex-col items-center gap-2 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Plus className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold">Add Exercise</span>
          </div>
        </button>
        
        <button
          onClick={() => setShowCreateBlockDialog(true)}
          className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-4 shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] touch-manipulation"
        >
          <div className="flex flex-col items-center gap-2 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Layers className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold">Add Block</span>
          </div>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          onClick={() => setShowEndDialog(true)}
          disabled={saving}
          className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 p-5 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] touch-manipulation"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-white/20 to-green-400/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
          <div className="relative flex items-center justify-center gap-3 text-white">
            <Square className="h-6 w-6 fill-white drop-shadow-md" />
            <span className="text-lg font-bold drop-shadow-md">
              {saving ? 'Saving...' : 'Finish Workout'}
            </span>
          </div>
        </button>
        
        <button
          onClick={() => setShowCancelDialog(true)}
          disabled={saving}
          className="w-full py-3 text-sm font-medium text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
        >
          Cancel Workout
        </button>
      </div>

      {/* Exercise Selector Dialog */}
      {showExerciseSelector && (
        <ExerciseSelector
          userId={userId}
          onSelect={handleAddExercise}
          onClose={() => setShowExerciseSelector(false)}
        />
      )}

      {/* Create Block Dialog */}
      <CreateBlockDialog
        open={showCreateBlockDialog}
        onOpenChange={setShowCreateBlockDialog}
        onCreateBlock={handleCreateBlock}
      />

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

