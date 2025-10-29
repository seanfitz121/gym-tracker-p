'use client'

import { useProfile } from '@/lib/hooks/use-profile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GamificationPanel } from '@/components/gamification/gamification-panel'
import { VolumeStatsCard } from '@/components/stats/volume-stats-card'
import { OnboardingTour } from '@/components/onboarding/onboarding-tour'
import { Button } from '@/components/ui/button'
import { AdBanner } from '@/components/ads/ad-banner'
import { AD_SLOTS } from '@/lib/config/ads'
import Link from 'next/link'
import { 
  Dumbbell, 
  TrendingUp, 
  Calendar, 
  Trophy,
  Calculator,
  Target,
  History,
  Users,
  Droplets,
  Scale
} from 'lucide-react'

interface DashboardPageProps {
  userId: string
}

export function DashboardPage({ userId }: DashboardPageProps) {
  const { profile } = useProfile(userId)

  const quickActions = [
    {
      icon: Dumbbell,
      label: 'Log Workout',
      href: '/app/log',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: History,
      label: 'History',
      href: '/app/history',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      icon: TrendingUp,
      label: 'Progress',
      href: '/app/progress',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      icon: Users,
      label: 'Social',
      href: '/app/social',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ]

  const toolsLinks = [
    {
      icon: Calculator,
      label: 'One Rep Max',
      href: '/app/tools#orm',
      description: 'Calculate your 1RM'
    },
    {
      icon: Target,
      label: 'Plate Calculator',
      href: '/app/tools#plates',
      description: 'Load the bar'
    },
    {
      icon: Scale,
      label: 'Weight Tracker',
      href: '/app/weight',
      description: 'Track body weight'
    },
    {
      icon: Droplets,
      label: 'Hydration',
      href: '/app/hydration',
      description: 'Log water intake'
    }
  ]

  return (
    <>
      {/* Onboarding Tour */}
      {profile && (
        <OnboardingTour 
          userId={userId} 
          onboardingCompleted={profile.onboarding_completed ?? true} 
        />
      )}

      <div className="container max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here's your progress at a glance.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon
          const isLogWorkout = action.href === '/app/log'
          return (
            <Link key={action.href} href={action.href}>
              <Card 
                className="hover:shadow-lg transition-shadow cursor-pointer h-full"
                data-tour={isLogWorkout ? 'log-workout' : undefined}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
                  <div className={`p-3 rounded-full ${action.bgColor}`}>
                    <Icon className={`h-6 w-6 ${action.color}`} />
                  </div>
                  <span className="font-medium text-sm">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Level Progress */}
        <div className="lg:col-span-2" data-tour="level-progress">
          <GamificationPanel userId={userId} />
        </div>

        {/* Volume Stats */}
        <div data-tour="volume-stats">
          <VolumeStatsCard userId={userId} />
        </div>

        {/* Tools */}
        <Card data-tour="tools">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Tools & Trackers
            </CardTitle>
            <CardDescription>
              Calculators and tracking tools to support your training
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {toolsLinks.map((tool) => {
                const Icon = tool.icon
                return (
                  <Link key={tool.href} href={tool.href}>
                    <div className="p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">{tool.label}</p>
                          <p className="text-xs text-gray-500">{tool.description}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
            <Button asChild variant="outline" className="w-full mt-4">
              <Link href="/app/tools">
                View All Tools
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Trophy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Leaderboard Rank</p>
                  <p className="text-xs text-gray-500">Check your position</p>
                </div>
              </div>
              <Button asChild size="sm" variant="ghost">
                <Link href="/app/social">View</Link>
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Progress Charts</p>
                  <p className="text-xs text-gray-500">Track your lifts</p>
                </div>
              </div>
              <Button asChild size="sm" variant="ghost">
                <Link href="/app/progress">View</Link>
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <History className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Workout History</p>
                  <p className="text-xs text-gray-500">Review past sessions</p>
                </div>
              </div>
              <Button asChild size="sm" variant="ghost">
                <Link href="/app/history">View</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ad - Non-intrusive banner at bottom (free users only) */}
      <div className="max-w-3xl mx-auto pt-4">
        <AdBanner 
          adSlot={AD_SLOTS.DASHBOARD_SIDEBAR} 
          adFormat="auto"
          className="my-6"
          showPlaceholder={true}
        />
      </div>
    </div>
    </>
  )
}

