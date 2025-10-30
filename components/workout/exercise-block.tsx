'use client'

import { useWorkoutStore } from '@/lib/store/workout-store'
import { useSettingsStore } from '@/lib/store/settings-store'
import { SetRow } from './set-row'
import { Plus, Trash2, Dumbbell } from 'lucide-react'
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
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-950 border border-blue-200 dark:border-blue-900 shadow-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 px-4 sm:px-5 py-4 border-b border-indigo-100 dark:border-indigo-900/50">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
                  <Dumbbell className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 truncate">
                  {exercise.name}
                </h3>
              </div>
              {exercise.bodyPart && (
                <div className="inline-flex items-center rounded-full bg-white dark:bg-gray-900 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-sm">
                  {exercise.bodyPart}
                </div>
              )}
            </div>
            <button
              onClick={() => removeExercise(exercise.id)}
              className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors touch-manipulation"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Sets */}
        <div className="p-3 sm:p-4 space-y-3">
          {exercise.sets.map((set) => (
            <SetRow
              key={set.id}
              exerciseId={exercise.id}
              set={set}
            />
          ))}

          {/* Add Set Button */}
          <button
            onClick={handleAddSet}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-3.5 sm:p-4 shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] touch-manipulation mt-2"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/0 via-white/20 to-purple-400/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            <div className="relative flex items-center justify-center gap-2 text-white">
              <Plus className="h-5 w-5" />
              <span className="font-semibold">Add Set</span>
            </div>
          </button>
        </div>
    </div>
  )
}

