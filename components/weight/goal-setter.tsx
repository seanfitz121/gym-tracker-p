'use client'

import { useState, useEffect } from 'react'
import { useWeightGoal, useSaveWeightGoal, useDeleteWeightGoal } from '@/lib/hooks/use-weight-goals'
import { useSettingsStore } from '@/lib/store/settings-store'
import { GoalType } from '@/lib/types/weight-goals'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Target, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface GoalSetterProps {
  currentWeight?: number
  onSuccess?: () => void
}

export function GoalSetter({ currentWeight, onSuccess }: GoalSetterProps) {
  const { goal, refresh } = useWeightGoal()
  const { saveGoal, loading: saving } = useSaveWeightGoal()
  const { deleteGoal, loading: deleting } = useDeleteWeightGoal()
  const { defaultWeightUnit } = useSettingsStore()

  const [targetWeight, setTargetWeight] = useState('')
  const [goalType, setGoalType] = useState<GoalType>('lose')
  const [unit, setUnit] = useState<'kg' | 'lb'>(defaultWeightUnit)
  const [showForm, setShowForm] = useState(false)

  const loading = saving || deleting

  useEffect(() => {
    if (goal) {
      setTargetWeight(goal.target_weight.toString())
      setGoalType(goal.goal_type)
      setUnit(goal.unit)
    }
  }, [goal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const weight = parseFloat(targetWeight)
    if (isNaN(weight) || weight <= 0) {
      toast.error('Please enter a valid target weight')
      return
    }

    const result = await saveGoal({
      target_weight: weight,
      unit,
      goal_type: goalType,
      start_weight: currentWeight,
    })

    if (result) {
      toast.success('Goal saved!')
      setShowForm(false)
      refresh()
      onSuccess?.()
    } else {
      toast.error('Failed to save goal')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your goal?')) return

    const success = await deleteGoal()
    if (success) {
      toast.success('Goal deleted')
      refresh()
      onSuccess?.()
    } else {
      toast.error('Failed to delete goal')
    }
  }

  if (!goal && !showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Set a Goal
          </CardTitle>
          <CardDescription>
            Define your target weight and track your progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowForm(true)} className="w-full">
            Set Weight Goal
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!showForm && goal) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Your Goal
              </CardTitle>
              <CardDescription>
                {goalType === 'lose' ? '📉 Lose weight' : goalType === 'gain' ? '📈 Gain weight' : '⚖️ Maintain weight'}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{goal.target_weight}</span>
            <span className="text-muted-foreground">{goal.unit}</span>
          </div>
          <Button variant="outline" onClick={() => setShowForm(true)} className="w-full">
            Update Goal
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {goal ? 'Update Goal' : 'Set Goal'}
        </CardTitle>
        <CardDescription>
          Define your target weight and goal type
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal-type">Goal Type</Label>
            <Select value={goalType} onValueChange={(v) => setGoalType(v as GoalType)}>
              <SelectTrigger id="goal-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lose">📉 Lose Weight</SelectItem>
                <SelectItem value="maintain">⚖️ Maintain Weight</SelectItem>
                <SelectItem value="gain">📈 Gain Weight</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target-weight">Target Weight</Label>
              <Input
                id="target-weight"
                type="number"
                step="0.1"
                min="0"
                max="999"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-unit">Unit</Label>
              <Select value={unit} onValueChange={(v) => setUnit(v as 'kg' | 'lb')} disabled={loading}>
                <SelectTrigger id="goal-unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lb">lb</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Saving...' : 'Save Goal'}
            </Button>
            {showForm && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  if (goal) {
                    setTargetWeight(goal.target_weight.toString())
                    setGoalType(goal.goal_type)
                    setUnit(goal.unit)
                  }
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}


