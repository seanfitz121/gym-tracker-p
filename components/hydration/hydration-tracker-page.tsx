'use client'

import { format, subDays } from 'date-fns'
import { usePremiumStatus } from '@/lib/hooks/use-premium'
import { useHydrationStats, useHydrationLogs, useAddHydration } from '@/lib/hooks/use-hydration'
import { useSettingsStore } from '@/lib/store/settings-store'
import { CircularProgress } from './circular-progress'
import { QuickAddButtons } from './quick-add-buttons'
import { StreakBadge } from './streak-badge'
import { WeeklyChart } from './weekly-chart'
import { TodaysLogs } from './todays-logs'
import { HydrationGoalSetter } from './goal-setter'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Droplet, Lock, Zap, ArrowLeft, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface HydrationTrackerPageProps {
  userId: string
}

export function HydrationTrackerPage({ userId }: HydrationTrackerPageProps) {
  const { isPremium, loading: premiumLoading } = usePremiumStatus()
  const { hydrationGoalMl } = useSettingsStore()
  
  // Fetch last 7 days of logs
  const startDate = format(subDays(new Date(), 6), 'yyyy-MM-dd')
  const { logs, loading: logsLoading, refresh: refreshLogs } = useHydrationLogs(startDate)
  
  const { stats, loading: statsLoading, refresh: refreshStats } = useHydrationStats(hydrationGoalMl)
  const { addHydration, loading: adding } = useAddHydration()

  const handleQuickAdd = async (amount: number) => {
    const result = await addHydration(amount)
    if (result) {
      toast.success(`Added ${amount}ml! 💧`)
      refreshLogs()
      refreshStats()
    } else {
      toast.error('Failed to add hydration')
    }
  }

  // Show loading state while checking premium status
  if (premiumLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-4 space-y-6">
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
              <Droplet className="h-8 w-8" />
              Hydration Tracker
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your daily water intake and stay hydrated
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
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Premium Feature</CardTitle>
            <CardDescription className="text-base">
              The Hydration Tracker is available exclusively for Premium members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Feature Preview */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-gray-950 rounded-lg border">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  💧 Daily Tracking
                </h3>
                <p className="text-sm text-muted-foreground">
                  Log your water intake throughout the day with quick-add buttons
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-950 rounded-lg border">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  📊 Progress Visualization
                </h3>
                <p className="text-sm text-muted-foreground">
                  Beautiful circular progress gauge showing your daily goal
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-950 rounded-lg border">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  🔥 Streak Counter
                </h3>
                <p className="text-sm text-muted-foreground">
                  Track consecutive days meeting your hydration goal
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-gray-950 rounded-lg border">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  📈 Weekly Charts
                </h3>
                <p className="text-sm text-muted-foreground">
                  View your last 7 days of hydration progress
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

  // Premium users: Show full hydration tracker
  const loading = logsLoading || statsLoading

  return (
    <div className="container max-w-4xl mx-auto p-4 pb-24 md:pb-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Droplet className="h-8 w-8 text-blue-600" />
            Hydration Tracker
            <Badge variant="secondary" className="ml-2">
              <Zap className="h-3 w-3 mr-1 fill-purple-600 text-purple-600" />
              Premium
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            Stay hydrated and healthy!
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/log">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <>
          {/* Goal Setter and Progress */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Circular Progress */}
            <Card className="p-6">
              <CircularProgress
                percentage={stats?.today_percentage || 0}
                current={(stats?.today_total || 0) / 1000}
                goal={hydrationGoalMl / 1000}
                unit="L"
              />
            </Card>

            {/* Goal Setter */}
            <HydrationGoalSetter />
          </div>

          {/* Quick Add Buttons */}
          <QuickAddButtons onAdd={handleQuickAdd} loading={adding} />

          {/* Stats Row */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Streak */}
            <Card className="p-4">
              <StreakBadge streak={stats?.current_streak || 0} />
              {(stats?.current_streak || 0) === 0 && (
                <div className="text-center text-sm text-muted-foreground mt-2">
                  Meet your goal to start a streak!
                </div>
              )}
            </Card>

            {/* Weekly Average */}
            <Card className="p-4">
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {((stats?.weekly_average || 0) / 1000).toFixed(2)}L
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Weekly Average
                  </div>
                </div>
              </div>
            </Card>

            {/* Best Day */}
            <Card className="p-4">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">🏆</span>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {((stats?.best_day_this_week || 0) / 1000).toFixed(2)}L
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Best This Week
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Weekly Chart */}
          <WeeklyChart logs={logs} goalMl={hydrationGoalMl} />

          {/* Today's Log */}
          <TodaysLogs logs={logs} onDeleted={() => { refreshLogs(); refreshStats(); }} />
        </>
      )}
    </div>
  )
}

