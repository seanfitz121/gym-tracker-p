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

interface WeightTrackerPageProps {
  userId: string
}

export function WeightTrackerPage({ userId }: WeightTrackerPageProps) {
  const { isPremium, loading: premiumLoading } = usePremiumStatus()
  const { defaultWeightUnit } = useSettingsStore()
  const { logs, loading: logsLoading, refresh } = useWeightLogs()
  const { goal, refresh: refreshGoal } = useWeightGoal()
  const { metrics, refresh: refreshMetrics } = useBodyMetrics()
  
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

  // Premium gate: Show upgrade prompt for non-premium users
  if (!isPremium) {
    return (
      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Scale className="h-8 w-8" />
              Weight Tracker
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your bodyweight progress with charts and insights
            </p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/app/log">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>

        {/* Premium Gate Card */}
        <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Premium Feature</CardTitle>
            <CardDescription className="text-base">
              The Weight Tracker is available exclusively for Premium members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Feature Preview */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-gray-950 rounded-lg border">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  📊 Interactive Charts
                </h3>
                <p className="text-sm text-muted-foreground">
                  Visualize your weight progress over time with beautiful, smooth charts
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-950 rounded-lg border">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  🎯 Smart Insights
                </h3>
                <p className="text-sm text-muted-foreground">
                  Get automatic feedback on weekly averages and weight changes
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-950 rounded-lg border">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  🔥 Tracking Streaks
                </h3>
                <p className="text-sm text-muted-foreground">
                  Build consistency with streak tracking for daily weigh-ins
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-950 rounded-lg border">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  ⚙️ Customizable
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose your unit (kg/lb) and enable chart smoothing
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-4">
              <Button size="lg" asChild className="gap-2">
                <Link href="/app/premium">
                  <Zap className="h-5 w-5" />
                  Upgrade to Premium
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground mt-3">
                Only €4/month · Cancel anytime
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Premium users: Show full weight tracker
  return (
    <div className="container max-w-6xl mx-auto p-4 pb-24 md:pb-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Scale className="h-8 w-8" />
            Weight Tracker
            <Badge variant="secondary" className="ml-2">
              <Zap className="h-3 w-3 mr-1 fill-purple-600 text-purple-600" />
              Premium
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your bodyweight progress with charts and insights
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/log">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      {/* Entry Form */}
      <WeightEntryForm
        editingLog={editingLog}
        onSuccess={handleSuccess}
        onCancel={editingLog ? handleCancel : undefined}
      />

      {/* Loading State */}
      {logsLoading ? (
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      ) : (
        <>
          {/* Goal and Progress Section */}
          {currentWeight && (
            <div className="grid md:grid-cols-2 gap-6">
              <GoalSetter currentWeight={currentWeight} onSuccess={refreshGoal} />
              {goal && (
                <GoalProgress goal={goal} logs={logs} currentWeight={currentWeight} />
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
            <BodyMetricsForm onSuccess={refreshMetrics} />
            {currentWeight && metrics && (
              <BodyCompositionDisplay weightKg={currentWeight} metrics={metrics} />
            )}
          </div>

          {/* History */}
          <WeightHistory
            logs={logs}
            onEdit={handleEdit}
            onDeleted={refresh}
          />
        </>
      )}
    </div>
  )
}

