'use client'

import { useMemo } from 'react'
import { WeightGoal } from '@/lib/types/weight-goals'
import { WeightLog } from '@/lib/types/weight'
import { calculateGoalProgress, hasProgressStalled } from '@/lib/utils/body-composition'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Target, TrendingDown, TrendingUp, Calendar, AlertCircle } from 'lucide-react'
import { format, parseISO } from 'date-fns'

interface GoalProgressProps {
  goal: WeightGoal
  logs: WeightLog[]
  currentWeight: number
}

export function GoalProgress({ goal, logs, currentWeight }: GoalProgressProps) {
  const progress = useMemo(() => {
    return calculateGoalProgress(goal, logs, currentWeight)
  }, [goal, logs, currentWeight])

  const stalled = useMemo(() => {
    return hasProgressStalled(logs, goal)
  }, [logs, goal])

  const GoalIcon = goal.goal_type === 'lose' ? TrendingDown : goal.goal_type === 'gain' ? TrendingUp : Target

  return (
    <Card className={progress.isCompleted ? 'border-green-500' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GoalIcon className="h-5 w-5" />
              Goal Progress
              {progress.isCompleted && (
                <Badge variant="default" className="bg-green-600">
                  Completed! 🎉
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {goal.goal_type === 'lose' ? 'Lose weight' : goal.goal_type === 'gain' ? 'Gain weight' : 'Maintain weight'} to {goal.target_weight} {goal.unit}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{progress.progressPercentage}%</span>
          </div>
          <Progress value={progress.progressPercentage} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Start: {progress.startWeight} {goal.unit}</span>
            <span>Target: {progress.targetWeight} {goal.unit}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Current Weight</div>
            <div className="text-2xl font-bold">
              {progress.currentWeight}
              <span className="text-sm font-normal text-muted-foreground ml-1">{goal.unit}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Remaining</div>
            <div className="text-2xl font-bold">
              {progress.remainingWeight}
              <span className="text-sm font-normal text-muted-foreground ml-1">{goal.unit}</span>
            </div>
          </div>

          {progress.avgWeightChangePerWeek !== null && (
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Avg Change/Week</div>
              <div className={`text-xl font-semibold ${
                goal.goal_type === 'lose' 
                  ? progress.avgWeightChangePerWeek < 0 ? 'text-green-600' : 'text-red-600'
                  : goal.goal_type === 'gain'
                  ? progress.avgWeightChangePerWeek > 0 ? 'text-green-600' : 'text-red-600'
                  : 'text-blue-600'
              }`}>
                {progress.avgWeightChangePerWeek > 0 ? '+' : ''}
                {progress.avgWeightChangePerWeek.toFixed(2)} {goal.unit}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Days Elapsed</div>
            <div className="text-xl font-semibold">
              {progress.daysElapsed} days
            </div>
          </div>
        </div>

        {/* ETA to Goal */}
        {!progress.isCompleted && progress.projectedGoalDate && (
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Calendar className="h-4 w-4" />
              Projected Goal Date
            </div>
            <p className="text-sm">
              At your current pace, you'll reach <strong>{goal.target_weight} {goal.unit}</strong> in approximately{' '}
              <strong>{progress.projectedDaysToGoal} days</strong> (
              {format(parseISO(progress.projectedGoalDate), 'MMM d, yyyy')})
            </p>
          </div>
        )}

        {/* Stalled Progress Warning */}
        {!progress.isCompleted && stalled && (
          <div className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="space-y-1">
                <div className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                  Progress has stalled
                </div>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Your weight hasn't changed significantly in the last 14 days. Consider reviewing your nutrition and training.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

