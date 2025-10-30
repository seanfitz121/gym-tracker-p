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
import { GetPremiumButton } from '@/components/premium/get-premium-button'
import { getDemoHydrationLogs, getDemoHydrationStats, DEMO_HYDRATION_GOAL } from '@/lib/demo-data/hydration-demo'

interface HydrationTrackerPageProps {
  userId: string
}

export function HydrationTrackerPage({ userId }: HydrationTrackerPageProps) {
  const { isPremium, loading: premiumLoading } = usePremiumStatus()
  const { hydrationGoalMl } = useSettingsStore()
  
  // Fetch last 7 days of logs (only for premium users)
  const startDate = format(subDays(new Date(), 6), 'yyyy-MM-dd')
  const { logs: realLogs, loading: logsLoading, refresh: refreshLogs } = useHydrationLogs(startDate)
  
  const { stats: realStats, loading: statsLoading, refresh: refreshStats } = useHydrationStats(hydrationGoalMl)
  const { addHydration, loading: adding } = useAddHydration()

  // Use demo data for non-premium users
  const logs = isPremium ? realLogs : getDemoHydrationLogs()
  const stats = isPremium ? realStats : getDemoHydrationStats()
  const goalMl = isPremium ? hydrationGoalMl : DEMO_HYDRATION_GOAL

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

  // Show full tracker for all users, but restrict actions for non-premium
  const loading = isPremium && (logsLoading || statsLoading)

  return (
    <div className="container max-w-4xl mx-auto p-4 pb-24 md:pb-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Droplet className="h-8 w-8 text-blue-600" />
            Hydration Tracker
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
            Stay hydrated and healthy!
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/app/tools">
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
                goal={goalMl / 1000}
                unit="L"
              />
            </Card>

            {/* Goal Setter */}
            {isPremium ? (
              <HydrationGoalSetter />
            ) : (
              <Card className="p-6 bg-gray-50 dark:bg-gray-900/50 border-dashed">
                <div className="text-center space-y-3 opacity-60 pointer-events-none">
                  <h3 className="font-semibold">Daily Goal: {goalMl / 1000}L</h3>
                  <p className="text-sm text-muted-foreground">
                    Customize your hydration goal with Premium
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Quick Add Buttons */}
          {isPremium ? (
            <QuickAddButtons onAdd={handleQuickAdd} loading={adding} />
          ) : (
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
              <div className="text-center space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Unlock Hydration Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Upgrade to Premium to log your water intake and track your progress
                  </p>
                </div>
                <GetPremiumButton size="lg">
                  Upgrade to Premium
                </GetPremiumButton>
              </div>
            </Card>
          )}

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
          <WeeklyChart logs={logs} goalMl={goalMl} />

          {/* Today's Log */}
          {isPremium ? (
            <TodaysLogs logs={logs} onDeleted={() => { refreshLogs(); refreshStats(); }} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Today's Log
                  <Badge variant="outline" className="text-xs">Demo</Badge>
                </CardTitle>
                <CardDescription>Sample hydration entries for today</CardDescription>
              </CardHeader>
              <CardContent className="opacity-60 pointer-events-none">
                <TodaysLogs logs={logs} onDeleted={() => {}} />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

