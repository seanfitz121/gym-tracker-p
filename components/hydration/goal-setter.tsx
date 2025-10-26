'use client'

import { useState } from 'react'
import { useSettingsStore } from '@/lib/store/settings-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Check, X } from 'lucide-react'
import { toast } from 'sonner'

export function HydrationGoalSetter() {
  const { hydrationGoalMl, updateSettings } = useSettingsStore()
  const [isEditing, setIsEditing] = useState(false)
  const [goalInput, setGoalInput] = useState((hydrationGoalMl / 1000).toFixed(1))

  const handleSave = () => {
    const newGoalLiters = parseFloat(goalInput)
    
    if (isNaN(newGoalLiters) || newGoalLiters < 0.5 || newGoalLiters > 10) {
      toast.error('Please enter a goal between 0.5L and 10L')
      return
    }

    const newGoalMl = Math.round(newGoalLiters * 1000)
    updateSettings({ hydrationGoalMl: newGoalMl })
    setIsEditing(false)
    toast.success(`Daily goal updated to ${newGoalLiters.toFixed(1)}L`)
  }

  const handleCancel = () => {
    setGoalInput((hydrationGoalMl / 1000).toFixed(1))
    setIsEditing(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Daily Goal
        </CardTitle>
        <CardDescription>
          Set your daily water intake target
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="goal-input" className="text-sm">
                  Goal (liters)
                </Label>
                <Input
                  id="goal-input"
                  type="number"
                  min="0.5"
                  max="10"
                  step="0.1"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="e.g., 3.0"
                  className="mt-1"
                  autoFocus
                />
              </div>
              <Button
                size="icon"
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={handleCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Recommended: 2-4 liters per day for most adults
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {(hydrationGoalMl / 1000).toFixed(1)}L
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {hydrationGoalMl}ml per day
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950"
            >
              Change Goal
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


