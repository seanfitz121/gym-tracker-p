import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { ComponentType } from 'react'
import { createClient } from '@/lib/supabase/server'
import { AuthForm } from '@/components/auth/auth-form'
import { ThemeLogo } from '@/components/common/theme-logo'
import { Footer } from '@/components/layout/footer'
import { ArrowLeft, BarChart3, Clock, ShieldCheck, Trophy } from 'lucide-react'

export default async function AuthPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/app/log')
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="flex flex-1 flex-col md:flex-row">
        <div className="relative hidden overflow-hidden border-r bg-foreground p-12 text-background md:flex md:w-1/2 md:flex-col md:justify-between">
          <div className="absolute inset-0 industrial-grid opacity-25" />
          <div className="relative z-10">
            <Link href="/" className="mb-12 inline-flex items-center gap-2 text-background/75 transition-colors hover:text-background">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to home</span>
            </Link>
            <div className="mt-12">
              <div className="mb-6">
                <ThemeLogo width={200} height={50} className="h-12 w-auto" priority />
              </div>
              <p className="mb-8 text-xl text-background/75">
                A fast, trustworthy training log built for the phone in your hand between sets.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-4 text-background/75">
            <AuthBenefit icon={Clock} title="Fast logging" text="Log workouts in under 60 seconds" />
            <AuthBenefit icon={BarChart3} title="Track progress" text="Charts, PR detection, and weekly history" />
            <AuthBenefit icon={Trophy} title="Stay motivated" text="Streaks, XP, ranks, and badges" />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center p-4 md:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8 md:hidden">
              <Link href="/" className="mb-6 inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Link>
              <div className="mb-4">
                <ThemeLogo width={180} height={45} className="h-10 w-auto" priority />
              </div>
              <p className="text-muted-foreground">Sign in to start tracking your workouts.</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Secure account access
              </div>
            </div>

            <AuthForm />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

function AuthBenefit({
  icon: Icon,
  title,
  text,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  text: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-1 h-5 w-5 text-primary" />
      <div>
        <div className="font-semibold text-background">{title}</div>
        <div className="text-sm">{text}</div>
      </div>
    </div>
  )
}
