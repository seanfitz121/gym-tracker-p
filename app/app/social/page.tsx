import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SocialPage } from '@/components/social/social-page'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Social - Plate Progress',
  description: 'Connect with friends, join gyms, and compete on leaderboards',
}

export default async function Social() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  return <SocialPage userId={user.id} />
}

