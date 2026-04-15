'use client'

import { useProfile } from '@/lib/hooks/use-profile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GamificationPanel } from '@/components/gamification/gamification-panel'
import { VolumeStatsCard } from '@/components/stats/volume-stats-card'
import { GymExpiryCard } from './gym-expiry-card'
import { OnboardingTour } from '@/components/onboarding/onboarding-tour'
import { Button } from '@/components/ui/button'
import { AdBanner } from '@/components/ads/ad-banner'
import { AD_SLOTS } from '@/lib/config/ads'
import { AppScreen, QuickAction, SectionHeader, TrainingCard, TrustPanel } from '@/components/ui/app-ui'
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
  Scale,
  MessageSquare,
  Activity
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
      icon: Activity,
      label: 'Cardio',
      href: '/app/cardio',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      icon: MessageSquare,
      label: 'Community',
      href: '/app/community',
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20'
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

      <AppScreen
        eyebrow="Training floor"
        title="Ready when you are."
        description="Start logging fast, check the numbers that matter, and keep the rest out of your way."
        className="max-w-7xl space-y-6"
      >

      <TrainingCard className="p-4 shadow-industrial">
        <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Next set</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight">Log today’s work before the warmup gets cold.</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Plate Progress is tuned for quick entries, clean history, and honest strength trends.
            </p>
          </div>
          <Link href="/app/log" data-tour="log-workout">
            <QuickAction icon={Dumbbell} title="Start workout" description="Open the logger and get moving" />
          </Link>
        </div>
      </TrainingCard>

      <SectionHeader title="Quick rack" description="The fastest paths through the app." />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.href} href={action.href} data-tour={action.href === '/app/log' ? 'log-workout' : undefined}>
              <QuickAction icon={Icon} title={action.label} description="Open" />
            </Link>
          )
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Level Progress */}
        <div className="lg:col-span-2" data-tour="level-progress">
          <GamificationPanel userId={userId} />
        </div>

        {/* Volume Stats */}
        <div data-tour="volume-stats">
          <VolumeStatsCard userId={userId} />
        </div>

        {/* Gym Membership Expiry */}
        <div>
          <GymExpiryCard 
            userId={userId} 
            expiryDate={profile?.gym_expiry_date || null} 
          />
        </div>

        {/* Tools */}
        <Card data-tour="tools">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Tools & Trackers
            </CardTitle>
            <CardDescription>
              Calculators and support trackers for the session around the session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {toolsLinks.map((tool) => {
                const Icon = tool.icon
                return (
                  <Link key={tool.href} href={tool.href}>
                    <QuickAction icon={Icon} title={tool.label} description={tool.description} />
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
          <CardContent className="grid grid-cols-1 gap-3">
            <Link href="/app/social"><QuickAction icon={Trophy} title="Leaderboard Rank" description="Check your position" /></Link>
            <Link href="/app/progress"><QuickAction icon={TrendingUp} title="Progress Charts" description="Track your lifts" /></Link>
            <Link href="/app/history"><QuickAction icon={History} title="Workout History" description="Review past sessions" /></Link>
          </CardContent>
        </Card>
      </div>

      <TrustPanel icon={Target} title="Built for the floor">
        Fast taps, readable numbers, and no fragile swipes standing between you and the next set.
      </TrustPanel>

      {/* Ad - Non-intrusive banner at bottom (free users only) */}
      <div className="max-w-3xl mx-auto pt-4">
        <AdBanner 
          adSlot={AD_SLOTS.DASHBOARD_SIDEBAR} 
          adFormat="auto"
          className="my-6"
          showPlaceholder={true}
        />
      </div>
    </AppScreen>
    </>
  )
}

