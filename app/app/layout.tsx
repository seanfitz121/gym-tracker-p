import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppNav } from '@/components/layout/app-nav'
import { AppHeader } from '@/components/layout/app-header'
import { LoadingBar } from '@/components/layout/loading-bar'
import { Analytics } from '@vercel/analytics/next';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <LoadingBar />
      <AppHeader user={user} />
      <main className="relative flex-1 overflow-y-auto pb-[calc(5.5rem+var(--safe-bottom))] md:pb-6">
        <div className="pointer-events-none fixed inset-x-0 top-0 h-48 industrial-grid opacity-40" />
        {children}
        <Analytics />
      </main>
      <AppNav />
    </div>
  )
}


