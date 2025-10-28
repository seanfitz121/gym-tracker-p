import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardPage } from '@/components/dashboard/dashboard-page'

export const metadata = {
  title: 'Dashboard | PlateProgress',
  description: 'Your workout dashboard - track progress, access tools, and stay motivated',
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  return <DashboardPage userId={user.id} />
}

