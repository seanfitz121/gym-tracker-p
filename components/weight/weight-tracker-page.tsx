'use client'

import { useState, useEffect } from 'react'
import { usePremiumStatus } from '@/lib/hooks/use-premium'
import { useWeightLogs } from '@/lib/hooks/use-weight'
import { useWeightGoal } from '@/lib/hooks/use-weight-goals'
import { useBodyMetrics } from '@/lib/hooks/use-weight-goals'
import { useSettingsStore } from '@/lib/store/settings-store'
import { WeightLog } from '@/lib/types/weight'
import { WeightEntryForm } from './weight-entry-form'
import { WeightChart } from './weight-chart'
import { WeightInsights } from './weight-insights'
import { WeightHistory } from './weight-history'
import { GoalSetter } from './goal-setter'
import { GoalProgress } from './goal-progress'
import { BodyMetricsForm } from './body-metrics-form'
import { BodyCompositionDisplay } from './body-composition-display'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Scale, Lock, Zap, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { GetPremiumButton } from '@/components/premium/get-premium-button'
import { getDemoWeightLogs, getDemoWeightGoal, getDemoBodyMetrics } from '@/lib/demo-data/weight-demo'

interface WeightTrackerPageProps {
  userId: string
}

export function WeightTrackerPage({ userId }: WeightTrackerPageProps) {
  const { isPremium, loading: premiumLoading } = usePremiumStatus()
  const { defaultWeightUnit } = useSettingsStore()
  const { logs: realLogs, loading: logsLoading, refresh } = useWeightLogs()
  const { goal: realGoal, refresh: refreshGoal } = useWeightGoal()
  const { metrics: realMetrics, refresh: refreshMetrics } = useBodyMetrics()
  
  // Use demo data for non-premium users
  const logs = isPremium ? realLogs : getDemoWeightLogs()
  const goal = isPremium ? realGoal : getDemoWeightGoal()
  const metrics = isPremium ? realMetrics : getDemoBodyMetrics()
  
  const [editingLog, setEditingLog] = useState<WeightLog | null>(null)
  const currentWeight = logs.length > 0 ? logs[0].weight : undefined

  const handleSuccess = () => {
    setEditingLog(null)
    refresh()
  }

  const handleEdit = (log: WeightLog) => {
    setEditingLog(log)
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancel = () => {
    setEditingLog(null)
  }

  // Show loading state while checking premium status
  if (premiumLoading) {
    return (
      <div className="container max-w-6xl mx-auto p-4 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  // Show full tracker for all users, but restrict actions for non-premium
  return (
    <div className="container max-w-6xl mx-auto p-4 pb-24 md:pb-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Scale className="h-8 w-8" />
            Weight Tracker
            {isPremium ? (
              <Badge variant="secondary" className="ml-2">
                <Zap className="h-3 w-3 mr-1 fill-purple-600 text-purple-600" />
                Premium
              </Badge>
            ) : (
              <Badge variant="outline" className="ml-2 text-xs">
                Demo Mode
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your bodyweight progress with charts and insights
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/tools">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      {/* Entry Form */}
      {isPremium ? (
        <WeightEntryForm
          editingLog={editingLog}
          onSuccess={handleSuccess}
          onCancel={editingLog ? handleCancel : undefined}
        />
      ) : (
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
          <div className="text-center space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Unlock Weight Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Upgrade to Premium to log your weight and track your progress over time
              </p>
            </div>
            <GetPremiumButton size="lg">
              Upgrade to Premium
            </GetPremiumButton>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {(isPremium && logsLoading) ? (
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      ) : (
        <>
          {/* Goal and Progress Section */}
          {currentWeight && (
            <div className="grid md:grid-cols-2 gap-6">
              {isPremium ? (
                <>
                  <GoalSetter currentWeight={currentWeight} onSuccess={refreshGoal} />
                  {goal && (
                    <GoalProgress goal={goal} logs={logs} currentWeight={currentWeight} />
                  )}
                </>
              ) : (
                <>
                  <Card className="p-6 bg-gray-50 dark:bg-gray-900/50 border-dashed opacity-60 pointer-events-none">
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold">Weight Goal</h3>
                      <p className="text-2xl font-bold">{goal?.target_weight} kg</p>
                      <p className="text-sm text-muted-foreground">Set custom goals with Premium</p>
                    </div>
                  </Card>
                  {goal && (
                    <div className="opacity-60 pointer-events-none">
                      <GoalProgress goal={goal} logs={logs} currentWeight={currentWeight} />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Chart and Insights */}
          <div className="grid md:grid-cols-2 gap-6">
            <WeightChart logs={logs} unit={defaultWeightUnit} />
            <WeightInsights logs={logs} unit={defaultWeightUnit} />
          </div>

          {/* Body Metrics Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {isPremium ? (
              <>
                <BodyMetricsForm onSuccess={refreshMetrics} />
                {currentWeight && metrics && (
                  <BodyCompositionDisplay weightKg={currentWeight} metrics={metrics} />
                )}
              </>
            ) : (
              <>
                <Card className="p-6 bg-gray-50 dark:bg-gray-900/50 border-dashed opacity-60 pointer-events-none">
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold">Body Metrics</h3>
                    <p className="text-sm text-muted-foreground">Add measurements with Premium</p>
                  </div>
                </Card>
                {currentWeight && metrics && (
                  <div className="opacity-60 pointer-events-none">
                    <BodyCompositionDisplay weightKg={currentWeight} metrics={metrics} />
                  </div>
                )}
              </>
            )}
          </div>

          {/* History */}
          {isPremium ? (
            <WeightHistory
              logs={logs}
              onEdit={handleEdit}
              onDeleted={refresh}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Weight History
                  <Badge variant="outline" className="text-xs">Demo</Badge>
                </CardTitle>
                <CardDescription>Sample weight entries</CardDescription>
              </CardHeader>
              <CardContent className="opacity-60 pointer-events-none">
                <WeightHistory
                  logs={logs}
                  onEdit={() => {}}
                  onDeleted={() => {}}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

