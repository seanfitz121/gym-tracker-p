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
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <LoadingBar />
      <AppHeader user={user} />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-4">
        {children}
        <Analytics />
      </main>
      <AppNav />
    </div>
  )
}


