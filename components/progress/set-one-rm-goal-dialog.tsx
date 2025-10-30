'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Target } from 'lucide-react'
import { Exercise } from '@/lib/types'
import { OneRMGoal } from '@/lib/types/one-rm'
import { toast } from 'sonner'
import { format, addMonths } from 'date-fns'

interface SetOneRMGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exercise: Exercise
  currentGoal?: OneRMGoal
  onGoalSet: () => void
}

export function SetOneRMGoalDialog({ 
  open, 
  onOpenChange, 
  exercise,
  currentGoal,
  onGoalSet 
}: SetOneRMGoalDialogProps) {
  const [targetWeight, setTargetWeight] = useState(currentGoal?.target_weight.toString() || '')
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>(currentGoal?.weight_unit || 'kg')
  const [targetDate, setTargetDate] = useState(
    currentGoal?.target_date || format(addMonths(new Date(), 3), 'yyyy-MM-dd')
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!targetWeight || parseFloat(targetWeight) <= 0) {
      toast.error('Please enter a valid target weight')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/one-rm/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise_id: exercise.id,
          target_weight: parseFloat(targetWeight),
          weight_unit: weightUnit,
          target_date: targetDate,
        }),
      })

      if (!res.ok) throw new Error('Failed to set goal')

      toast.success(currentGoal ? '1RM goal updated!' : '1RM goal set!')
      onGoalSet()
      onOpenChange(false)
    } catch (error) {
      console.error('Error setting goal:', error)
      toast.error('Failed to set goal')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {currentGoal ? 'Update 1RM Goal' : 'Set 1RM Goal'}
          </DialogTitle>
          <DialogDescription>
            Set a target for {exercise.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Weight */}
          <div className="space-y-2">
            <Label htmlFor="targetWeight">Target Weight</Label>
            <div className="flex gap-2">
              <Input
                id="targetWeight"
                type="number"
                step="0.1"
                min="0"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder="100"
                required
                className="flex-1"
              />
              <Select value={weightUnit} onValueChange={(v) => setWeightUnit(v as 'kg' | 'lb')}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lb">lb</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Target Date */}
          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Date (Optional)</Label>
            <Input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <Label>Quick Timeframes</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTargetDate(format(addMonths(new Date(), 1), 'yyyy-MM-dd'))}
              >
                1 Month
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTargetDate(format(addMonths(new Date(), 3), 'yyyy-MM-dd'))}
              >
                3 Months
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTargetDate(format(addMonths(new Date(), 6), 'yyyy-MM-dd'))}
              >
                6 Months
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : currentGoal ? 'Update Goal' : 'Set Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

