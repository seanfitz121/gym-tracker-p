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
}

export function SetRow({ exerciseId, set }: SetRowProps) {
  const { updateSet, removeSet, duplicateSet, startRestTimer } = useWorkoutStore()

  const handleUpdate = (field: keyof ActiveSet, value: any) => {
    updateSet(exerciseId, set.id, { [field]: value })
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg space-y-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Set {set.setOrder}
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              duplicateSet(exerciseId, set.id)
              playStartSound()
              startRestTimer(60)
            }}
            className="h-8 px-2"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeSet(exerciseId, set.id)}
            className="h-8 px-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Weight */}
        <div>
          <Label className="text-xs text-gray-500 mb-1">Weight</Label>
          <Input
            type="number"
            value={set.weight || ''}
            onChange={(e) => handleUpdate('weight', parseFloat(e.target.value) || 0)}
            placeholder="0"
            className="h-11 text-base"
            step="0.5"
            min="0"
          />
        </div>

        {/* Reps */}
        <div>
          <Label className="text-xs text-gray-500 mb-1">Reps</Label>
          <Input
            type="number"
            value={set.reps || ''}
            onChange={(e) => handleUpdate('reps', parseInt(e.target.value) || 0)}
            placeholder="0"
            className="h-11 text-base"
            min="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 items-end">
        {/* Unit */}
        <div>
          <Label className="text-xs text-gray-500 mb-1">Unit</Label>
          <Select
            value={set.weightUnit}
            onValueChange={(value) => handleUpdate('weightUnit', value)}
          >
            <SelectTrigger className="h-11">
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
          <Label className="text-xs text-gray-500 mb-1">RPE</Label>
          <Input
            type="number"
            value={set.rpe || ''}
            onChange={(e) => handleUpdate('rpe', parseFloat(e.target.value) || undefined)}
            placeholder="—"
            className="h-11 text-base"
            step="0.5"
            min="0"
            max="10"
          />
        </div>

        {/* Warmup */}
        <div className="flex items-center justify-center h-11">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={set.isWarmup}
              onCheckedChange={(checked) => handleUpdate('isWarmup', !!checked)}
            />
            <span className="text-xs text-gray-600">Warmup</span>
          </label>
        </div>
      </div>
    </div>
  )
}

