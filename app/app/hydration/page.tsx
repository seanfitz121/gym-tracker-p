import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HydrationTrackerPage } from '@/components/hydration/hydration-tracker-page'

export const metadata: Metadata = {
  title: 'Hydration Tracker - Plate Progress',
  description: 'Track your daily water intake and stay hydrated',
}

export default async function HydrationPage() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth')
  }

  return <HydrationTrackerPage userId={user.id} />
}


