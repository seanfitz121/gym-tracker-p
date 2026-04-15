'use client'

import { useState, useEffect } from 'react'
import { useWorkoutStore } from '@/lib/store/workout-store'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Play, Square, Plus, Layers, Dumbbell, Timer, TrendingUp, FileText, ShieldCheck } from 'lucide-react'
import { MetricTile, StickyActionBar, TrainingCard, TrustPanel } from '@/components/ui/app-ui'
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
          toast.success('New personal record!', {
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
          toast.success(`Level up! You're now level ${newLevel}.`)
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
          toast.success(`Rank up! You're now ${rankName}.`, {
            duration: 5000,
          })
        }

        // Update streak
        const { currentStreak, streakIncreased } = await updateStreak(userId)
        
        if (streakIncreased) {
          toast.success(`${currentStreak} day streak.`)
          
          // Check for streak badges
          if (currentStreak === 7) {
            await addBadge(userId, 'streak_7')
            toast.success('Badge unlocked: 7-day streak')
          } else if (currentStreak === 30) {
            await addBadge(userId, 'streak_30')
            toast.success('Badge unlocked: 30-day streak')
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
        <TrainingCard className="p-5 shadow-industrial">
          <div className="absolute inset-0 industrial-grid opacity-40" />
          <div className="relative z-10 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Dumbbell className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight md:text-3xl">
                Ready to train?
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Start empty or load a template. The logger stays fast even when the session gets heavy.
              </p>
            </div>
          </div>
        </TrainingCard>

        {/* Action Cards */}
        <div className="grid gap-3">
          <button
            onClick={handleStartWorkout}
            className="group relative overflow-hidden rounded-lg border border-accent/30 bg-accent p-5 text-accent-foreground shadow-industrial transition-all duration-200 active:scale-[0.98]"
          >
            <div className="relative flex items-center justify-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-background/20">
                <Play className="h-6 w-6 fill-current" />
              </div>
              <div className="text-left">
                <div className="text-lg font-black">Start Empty Workout</div>
                <div className="text-xs opacity-80">Build your session from scratch</div>
              </div>
            </div>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center px-4">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center">
              <span className="rounded-md bg-background px-3 py-1 text-xs font-bold uppercase text-muted-foreground">
                Or use a template
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-dashed bg-card/70 p-4 backdrop-blur-sm">
            <TemplatesDropdown userId={userId} />
          </div>
        </div>

        <TrustPanel icon={ShieldCheck} title="Clean data in, useful progress out">
          Log at least 2 work sets per exercise for better XP, PR detection, and trend quality.
        </TrustPanel>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Workout Header */}
      <TrainingCard className="p-4 shadow-industrial sm:p-5">
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
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <MetricTile icon={Timer} label="Duration" value={formatDuration(elapsedTime)} tone="primary" />
            <MetricTile icon={Dumbbell} label="Exercises" value={activeWorkout.exercises.length + activeWorkout.blocks.reduce((sum, block) => sum + block.exercises.length, 0)} />
            <MetricTile icon={TrendingUp} label="Sets" value={activeWorkout.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => !s.isWarmup).length, 0) +
                   activeWorkout.blocks.reduce((sum, block) => sum + block.exercises.reduce((exSum, ex) => exSum + ex.sets.filter(s => !s.isWarmup).length, 0), 0)} tone="success" />
          </div>
      </TrainingCard>

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
          className="group relative overflow-hidden rounded-lg border bg-primary p-4 text-primary-foreground shadow-sm transition-all duration-200 active:scale-[0.98]"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-background/20 backdrop-blur-sm">
              <Plus className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold">Add Exercise</span>
          </div>
        </button>
        
        <button
          onClick={() => setShowCreateBlockDialog(true)}
          className="group relative overflow-hidden rounded-lg border bg-secondary p-4 text-secondary-foreground shadow-sm transition-all duration-200 active:scale-[0.98]"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-background/30 backdrop-blur-sm">
              <Layers className="h-6 w-6" />
            </div>
            <span className="text-sm font-semibold">Add Block</span>
          </div>
        </button>
      </div>

      {/* Action Buttons */}
      <StickyActionBar>
      <div className="space-y-2">
        <button
          onClick={() => setShowEndDialog(true)}
          disabled={saving}
          className="group relative w-full overflow-hidden rounded-lg bg-accent p-4 text-accent-foreground shadow-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
        >
          <div className="relative flex items-center justify-center gap-3">
            <Square className="h-5 w-5 fill-current" />
            <span className="text-base font-black">
              {saving ? 'Saving...' : 'Finish Workout'}
            </span>
          </div>
        </button>
        
        <button
          onClick={() => setShowCancelDialog(true)}
          disabled={saving}
          className="w-full py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel Workout
        </button>
      </div>
      </StickyActionBar>

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
              Your workout will be saved and you&apos;ll earn XP and update your streak.
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
