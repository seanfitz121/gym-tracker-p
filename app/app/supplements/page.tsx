import { createClient } from '@/lib/supabase/server'
import { SupplementTrackerPage } from '@/components/supplements/supplement-tracker-page'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Supplement Tracker',
  description: 'Track your daily supplement intake and adherence',
}

export default async function SupplementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  return <SupplementTrackerPage userId={user.id} />
}

