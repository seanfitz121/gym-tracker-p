import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ComponentType } from 'react'
import { createClient } from '@/lib/supabase/server'
import { AutoRedirect } from '@/components/auth/auto-redirect'
import { ThemeLogo } from '@/components/common/theme-logo'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdBanner } from '@/components/ads/ad-banner'
import { AD_SLOTS } from '@/lib/config/ads'
import { BarChart3, CheckCircle2, Clock, Dumbbell, Lock, Smartphone, Trophy } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/app/log')
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <AutoRedirect />

      <nav className="sticky top-0 z-50 border-b bg-background/88 backdrop-blur-xl safe-pt">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <ThemeLogo width={160} height={40} className="h-9 w-auto" priority />
          <Button asChild size="sm">
            <Link href="/auth">Sign in</Link>
          </Button>
        </div>
      </nav>

      <main>
        <section className="relative overflow-hidden px-4 py-12 md:py-20">
          <div className="absolute inset-0 industrial-grid opacity-50" />
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div className="relative z-10 max-w-3xl">
              <Badge variant="secondary" className="mb-5 gap-2">
                <Smartphone className="h-3.5 w-3.5" />
                Mobile-first PWA
              </Badge>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-7xl">
                Log the work. Trust the numbers.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Plate Progress is a fast training log for lifters who want clean set entry,
                honest PR tracking, and progress that survives the noise of a busy gym floor.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/auth">Start free</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/blog">Read training notes</Link>
                </Button>
              </div>
              <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
                <Stat value="<60s" label="Fast logging" />
                <Stat value="PR" label="Auto detection" />
                <Stat value="PWA" label="Phone ready" />
              </div>
            </div>

            <div className="relative z-10 mx-auto w-full max-w-sm">
              <div className="rounded-[2rem] border bg-foreground p-3 text-background shadow-industrial">
                <div className="rounded-[1.5rem] bg-background p-4 text-foreground rubber-texture">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Today</p>
                      <p className="text-xl font-black">Push Session</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <PhoneRow title="Bench Press" meta="100kg x 5" />
                    <PhoneRow title="Incline DB Press" meta="32kg x 8" />
                    <PhoneRow title="Cable Fly" meta="22kg x 12" />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <MiniMetric label="Sets" value="14" />
                    <MiniMetric label="Time" value="42m" />
                    <MiniMetric label="XP" value="+31" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Built like equipment</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">Strong where it matters.</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Feature icon={Clock} title="Fast set entry" text="Large controls and clear defaults keep you moving between sets." />
              <Feature icon={BarChart3} title="Readable trends" text="Volume, 1RM estimates, and progress charts use accessible contrast." />
              <Feature icon={Trophy} title="PR moments" text="Personal records, rank, streak, and XP feedback without clutter." />
              <Feature icon={Lock} title="Trustworthy core" text="Existing auth, data, privacy, and export workflows stay intact." />
            </div>
          </div>
        </section>

        <section className="px-4 py-8">
          <div className="mx-auto max-w-3xl">
            <AdBanner
              adSlot={AD_SLOTS.CONTENT_SEPARATOR}
              adFormat="auto"
              showPlaceholder={false}
              className="my-6"
            />
          </div>
        </section>

        <section className="px-4 py-12">
          <div className="mx-auto max-w-4xl rounded-lg border bg-card p-6 shadow-industrial md:p-10">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h2 className="text-3xl font-black tracking-tight">Your next workout starts here.</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Create an account, install it to your phone, and keep the log close to the bar.
                </p>
              </div>
              <Button asChild size="lg">
                <Link href="/auth">Get started</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border bg-card/80 p-3">
      <div className="text-xl font-black tabular-nums text-primary">{value}</div>
      <div className="mt-1 text-xs font-semibold text-muted-foreground">{label}</div>
    </div>
  )
}

function PhoneRow({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card/90 p-3">
      <div>
        <p className="font-black">{title}</p>
        <p className="text-xs text-muted-foreground">{meta}</p>
      </div>
      <CheckCircle2 className="h-5 w-5 text-accent" />
    </div>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-secondary p-2 text-center">
      <div className="text-lg font-black">{value}</div>
      <div className="text-[10px] font-bold uppercase text-muted-foreground">{label}</div>
    </div>
  )
}

function Feature({ icon: Icon, title, text }: { icon: ComponentType<{ className?: string }>; title: string; text: string }) {
  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  )
}
