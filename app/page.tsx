import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AutoRedirect } from '@/components/auth/auto-redirect'
import { ThemeLogo } from '@/components/common/theme-logo'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dumbbell, TrendingUp, Trophy, Zap, Target, BarChart3, Clock, Smartphone } from 'lucide-react'

// Force dynamic rendering - don't cache this page
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  // Check if user is already signed in
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is authenticated, redirect to app
  if (user) {
    redirect('/app/log')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Client-side auth check as backup */}
      <AutoRedirect />
      
      {/* Navigation */}
      <nav className="border-b sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <ThemeLogo
            width={160}
            height={40}
            className="h-10 w-auto"
            priority
          />
          <Button asChild size="sm">
            <Link href="/auth">Sign In</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Smartphone className="h-3 w-3 mr-1" />
              Mobile-First Design
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              Your Workout Tracker,
              <br />
              <span className="text-blue-600">Simplified</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Log exercises, track progress, and crush your PRs with the fastest mobile workout tracker. Built for lifters who value simplicity and speed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="text-base">
                <Link href="/auth">Start Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base">
                <Link href="#features">See Features</Link>
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-16">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600">&lt; 60s</div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">To log a workout</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-green-600">100%</div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Free to use</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-purple-600">Offline</div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Works anywhere</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 dark:bg-gray-900 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A complete toolkit for tracking your fitness journey, with no complexity or clutter
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Clock className="h-8 w-8" />}
              title="Lightning Fast"
              description="Log complete workouts in under a minute with smart defaults and quick actions"
              color="blue"
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Visual Progress"
              description="Beautiful charts showing 1RM estimates, top sets, and volume trends"
              color="green"
            />
            <FeatureCard
              icon={<Trophy className="h-8 w-8" />}
              title="Auto PR Detection"
              description="Celebrate every personal record as soon as you hit it"
              color="yellow"
            />
            <FeatureCard
              icon={<Target className="h-8 w-8" />}
              title="Gamification"
              description="Stay motivated with XP, streaks, badges, and weekly goals"
              color="purple"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple Three-Step Process
            </h2>
          </div>
          
          <div className="space-y-8">
            <StepCard
              number="1"
              title="Start Your Workout"
              description="Tap one button to begin tracking. No complicated setup."
            />
            <StepCard
              number="2"
              title="Log Your Sets"
              description="Add exercises and log weight, reps, and optional RPE for each set."
            />
            <StepCard
              number="3"
              title="Track Your Progress"
              description="View charts, PRs, and workout history. Watch yourself get stronger."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <Card className="max-w-3xl mx-auto p-8 md:p-12 text-center border-2">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Level Up?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Start tracking your workouts today. No credit card required.
          </p>
          <Button asChild size="lg" className="text-base">
            <Link href="/auth">Get Started Free</Link>
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: 'blue' | 'green' | 'yellow' | 'purple'
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',
    green: 'text-green-600 bg-green-50 dark:bg-green-950/30',
    yellow: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30',
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className={`inline-flex p-3 rounded-lg mb-4 ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </Card>
  )
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  )
}
