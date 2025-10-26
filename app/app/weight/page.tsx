import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WeightTrackerPage } from '@/components/weight/weight-tracker-page'

export const metadata: Metadata = {
  title: 'Weight Tracker - Plate Progress',
  description: 'Track your bodyweight progress with charts and insights',
}

export default async function WeightPage() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth')
  }

  return <WeightTrackerPage userId={user.id} />
}


