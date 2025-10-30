'use client'

import { useWorkoutStore } from '@/lib/store/workout-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Copy, Trash2, Timer } from 'lucide-react'
import { playStartSound } from '@/lib/utils/sounds'
import type { ActiveSet } from '@/lib/types'

interface SetRowProps {
  exerciseId: string
  set: ActiveSet
  userId?: string
  compact?: boolean
  onUpdate?: (updates: Partial<ActiveSet>) => void
  onRemove?: () => void
}

export function SetRow({ exerciseId, set, userId, compact, onUpdate, onRemove }: SetRowProps) {
  const { updateSet, removeSet, duplicateSet, startRestTimer } = useWorkoutStore()

  const handleUpdate = (field: keyof ActiveSet, value: any) => {
    if (onUpdate) {
      onUpdate({ [field]: value })
    } else {
      updateSet(exerciseId, set.id, { [field]: value })
    }
  }

  const handleRemove = () => {
    if (onRemove) {
      onRemove()
    } else {
      removeSet(exerciseId, set.id)
    }
  }

  return (
    <div className={`bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm ${compact ? 'p-2.5' : 'p-4'}`}>
      <div className={`flex items-center justify-between ${compact ? 'mb-2' : 'mb-3'}`}>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold shadow-sm">
            {set.setOrder}
          </div>
          <span className={`font-semibold text-gray-700 dark:text-gray-300 ${compact ? 'text-xs' : 'text-sm'}`}>
            Set {set.setOrder}
          </span>
          {set.isWarmup && (
            <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-950 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
              W
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {!compact && (
            <button
              onClick={() => {
                duplicateSet(exerciseId, set.id)
                playStartSound()
                startRestTimer(60)
              }}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors touch-manipulation"
            >
              <Copy className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={handleRemove}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors touch-manipulation"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-2 ${compact ? 'gap-2' : 'gap-3'}`}>
        {/* Weight */}
        <div>
          <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Weight</Label>
          <Input
            type="number"
            value={set.weight || ''}
            onChange={(e) => handleUpdate('weight', parseFloat(e.target.value) || 0)}
            placeholder="0"
            className={`${compact ? 'h-10 text-sm' : 'h-12 text-base'} font-semibold bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 touch-manipulation`}
            step="0.5"
            min="0"
          />
        </div>

        {/* Reps */}
        <div>
          <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Reps</Label>
          <Input
            type="number"
            value={set.reps || ''}
            onChange={(e) => handleUpdate('reps', parseInt(e.target.value) || 0)}
            placeholder="0"
            className={`${compact ? 'h-10 text-sm' : 'h-12 text-base'} font-semibold bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 touch-manipulation`}
            min="0"
          />
        </div>
      </div>

      <div className={`grid ${compact ? 'grid-cols-2 gap-2 mt-2' : 'grid-cols-3 gap-2 mt-3'}`}>
        {/* Unit */}
        <div>
          <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">Unit</Label>
          <Select
            value={set.weightUnit}
            onValueChange={(value) => handleUpdate('weightUnit', value)}
          >
            <SelectTrigger className={`${compact ? 'h-10' : 'h-12'} bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 font-semibold touch-manipulation`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">kg</SelectItem>
              <SelectItem value="lb">lb</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* RPE */}
        <div>
          <Label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 block">RPE</Label>
          <Input
            type="number"
            value={set.rpe || ''}
            onChange={(e) => handleUpdate('rpe', parseFloat(e.target.value) || undefined)}
            placeholder="—"
            className={`${compact ? 'h-10 text-sm' : 'h-12 text-base'} font-semibold bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 text-center touch-manipulation`}
            step="0.5"
            min="0"
            max="10"
          />
        </div>

        {/* Warmup */}
        {!compact && (
          <div className="flex items-end pb-0.5">
            <label className="flex items-center gap-2 cursor-pointer w-full h-12 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors touch-manipulation">
              <Checkbox
                checked={set.isWarmup}
                onCheckedChange={(checked) => handleUpdate('isWarmup', !!checked)}
                className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
              />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Warmup</span>
            </label>
          </div>
        )}
      </div>
    </div>
  )
}

