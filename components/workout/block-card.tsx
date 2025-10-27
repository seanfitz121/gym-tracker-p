'use client'

import { useState } from 'react'
import { useWorkoutStore } from '@/lib/store/workout-store'
import { useSettingsStore } from '@/lib/store/settings-store'
import { SetRow } from './set-row'
import { ExerciseSelector } from './exercise-selector'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronDown, ChevronUp, Trash2, Play, Check, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import type { ActiveBlock } from '@/lib/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface BlockCardProps {
  block: ActiveBlock
  userId: string
}

const BLOCK_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  superset: { label: 'Superset', color: 'bg-purple-500' },
  triset: { label: 'Tri-Set', color: 'bg-indigo-500' },
  giant: { label: 'Giant Set', color: 'bg-blue-500' },
  drop: { label: 'Drop Set', color: 'bg-orange-500' },
}

export function BlockCard({ block, userId }: BlockCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [currentRound, setCurrentRound] = useState(block.currentRound)
  const [showExerciseSelector, setShowExerciseSelector] = useState(false)
  const { 
    removeBlock, 
    updateBlock, 
    removeExerciseFromBlock,
    addExerciseToBlock,
    addSetToBlock, 
    updateSetInBlock, 
    removeSetFromBlock,
    completeRound,
    startRestTimer,
  } = useWorkoutStore()
  const { defaultRestTimer } = useSettingsStore()

  const blockInfo = BLOCK_TYPE_LABELS[block.blockType] || { label: block.blockType, color: 'bg-gray-500' }
  
  const handleRemoveBlock = () => {
    if (confirm('Remove this block? All exercises and sets will be lost.')) {
      removeBlock(block.id)
      toast.success('Block removed')
    }
  }

  const handleCompleteRound = () => {
    completeRound(block.id, currentRound)
    
    // Start rest timer if not on last round
    if (currentRound < block.rounds) {
      startRestTimer(block.restBetweenRounds)
      toast.success(`Round ${currentRound} complete! Rest ${block.restBetweenRounds}s`, {
        duration: 3000,
      })
      setCurrentRound(currentRound + 1)
    } else {
      toast.success('🎉 Block complete!', {
        duration: 3000,
      })
    }
  }

  const handleRemoveExercise = (exerciseId: string) => {
    if (confirm('Remove this exercise from the block?')) {
      removeExerciseFromBlock(block.id, exerciseId)
    }
  }

  const handleAddSet = (exerciseId: string) => {
    addSetToBlock(block.id, exerciseId, currentRound)
  }

  const handleAddExercise = (exerciseId: string, name: string, bodyPart?: string) => {
    addExerciseToBlock(block.id, exerciseId, name, bodyPart)
    setShowExerciseSelector(false)
    toast.success(`${name} added to block`)
  }

  const isRoundComplete = block.completedRounds.includes(currentRound)

  // Get sets for current round
  const exercisesWithRoundSets = block.exercises.map((exercise) => ({
    ...exercise,
    roundSets: exercise.sets.filter((set) => set.roundIndex === currentRound),
  }))

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn(blockInfo.color, 'text-white')}>
                {blockInfo.label}
              </Badge>
              <span className="text-sm text-gray-500">
                {block.exercises.length} exercise{block.exercises.length !== 1 ? 's' : ''} × {block.rounds} rounds
              </span>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {block.exercises.map((ex, idx) => (
                <span key={ex.id} className="text-sm font-medium">
                  {ex.name}
                  {idx < block.exercises.length - 1 && <span className="text-gray-400 mx-1">+</span>}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveBlock}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4 pt-0">
          {/* Round Navigation */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentRound(Math.max(1, currentRound - 1))}
              disabled={currentRound === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-center">
              <div className="text-lg font-bold">
                Round {currentRound} / {block.rounds}
              </div>
              {isRoundComplete && (
                <Badge variant="secondary" className="mt-1">
                  <Check className="h-3 w-3 mr-1" />
                  Complete
                </Badge>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentRound(Math.min(block.rounds, currentRound + 1))}
              disabled={currentRound === block.rounds}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Exercises in this round */}
          <div className="space-y-4">
            {exercisesWithRoundSets.map((exercise, idx) => (
              <div key={exercise.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">
                      {String.fromCharCode(65 + idx)}. {exercise.name}
                    </div>
                    {exercise.bodyPart && (
                      <div className="text-xs text-gray-500">{exercise.bodyPart}</div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveExercise(exercise.id)}
                    className="text-red-600 hover:text-red-700 h-8"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Sets for this exercise in current round */}
                <div className="space-y-1">
                  {exercise.roundSets.map((set) => (
                    <SetRow
                      key={set.id}
                      set={set}
                      exerciseId={exercise.id}
                      onUpdate={(updates) => updateSetInBlock(block.id, exercise.id, set.id, updates)}
                      onRemove={() => removeSetFromBlock(block.id, exercise.id, set.id)}
                      userId={userId}
                      compact
                    />
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSet(exercise.id)}
                    className="w-full mt-1"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Set
                  </Button>
                </div>
              </div>
            ))}

            {/* Add Exercise to Block Button */}
            {block.exercises.length < (block.blockType === 'superset' ? 2 : block.blockType === 'triset' ? 3 : 10) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExerciseSelector(true)}
                className="w-full"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Exercise to Block
              </Button>
            )}
          </div>

          {/* Rest Between Rounds */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Label htmlFor={`rest-${block.id}`} className="text-xs">Rest between rounds:</Label>
            <Input
              id={`rest-${block.id}`}
              type="number"
              value={block.restBetweenRounds}
              onChange={(e) => updateBlock(block.id, { restBetweenRounds: parseInt(e.target.value) || 60 })}
              className="w-20 h-8 text-sm"
              min={0}
              max={600}
            />
            <span className="text-xs">seconds</span>
          </div>

          {/* Complete Round Button */}
          {!isRoundComplete && exercisesWithRoundSets.some(ex => ex.roundSets.length > 0) && (
            <Button
              onClick={handleCompleteRound}
              className="w-full"
              variant={currentRound === block.rounds ? 'default' : 'secondary'}
            >
              <Check className="mr-2 h-4 w-4" />
              {currentRound === block.rounds ? 'Finish Block' : 'Complete Round & Rest'}
            </Button>
          )}
        </CardContent>
      )}

      {/* Exercise Selector Dialog */}
      {showExerciseSelector && (
        <ExerciseSelector
          userId={userId}
          onSelect={handleAddExercise}
          onClose={() => setShowExerciseSelector(false)}
        />
      )}
    </Card>
  )
}

