import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AuthForm } from '@/components/auth/auth-form'
import { ArrowLeft, Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function AuthPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/app/log')
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Branding (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-blue-600 p-12 flex-col justify-between">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-blue-100 transition-colors mb-12">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to home</span>
          </Link>
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <Dumbbell className="h-10 w-10 text-white" />
              <h1 className="text-3xl font-bold text-white">Gym Tracker</h1>
            </div>
            <p className="text-xl text-blue-100 mb-8">
              The simplest way to track your workouts and see real progress
            </p>
          </div>
        </div>
        <div className="space-y-4 text-blue-100">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚡</div>
            <div>
              <div className="font-semibold text-white">Lightning Fast</div>
              <div className="text-sm">Log workouts in under 60 seconds</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-2xl">📊</div>
            <div>
              <div className="font-semibold text-white">Track Progress</div>
              <div className="text-sm">Beautiful charts and PR detection</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-2xl">🏆</div>
            <div>
              <div className="font-semibold text-white">Stay Motivated</div>
              <div className="text-sm">Streaks, XP, and gamification</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="md:hidden mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-6">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
            <div className="flex items-center gap-2 mb-4">
              <Dumbbell className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold">Gym Tracker</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to start tracking your workouts
            </p>
          </div>

          <AuthForm />
        </div>
      </div>
    </div>
  )
}

