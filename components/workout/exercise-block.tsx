'use client'

import { useWorkoutStore } from '@/lib/store/workout-store'
import { useSettingsStore } from '@/lib/store/settings-store'
import { SetRow } from './set-row'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2 } from 'lucide-react'
import type { ActiveExercise } from '@/lib/types'

interface ExerciseBlockProps {
  exercise: ActiveExercise
  userId: string
}

export function ExerciseBlock({ exercise, userId }: ExerciseBlockProps) {
  const { addSet, removeExercise } = useWorkoutStore()
  const { defaultWeightUnit } = useSettingsStore()

  const handleAddSet = () => {
    addSet(exercise.id, { weightUnit: defaultWeightUnit })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{exercise.name}</CardTitle>
            {exercise.bodyPart && (
              <Badge variant="secondary" className="mt-1 text-xs">
                {exercise.bodyPart}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeExercise(exercise.id)}
            className="text-gray-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {/* Sets */}
        {exercise.sets.map((set) => (
          <SetRow
            key={set.id}
            exerciseId={exercise.id}
            set={set}
          />
        ))}

        {/* Add Set Button */}
        <Button
          onClick={handleAddSet}
          variant="outline"
          size="lg"
          className="w-full mt-3"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Set
        </Button>
      </CardContent>
    </Card>
  )
}

