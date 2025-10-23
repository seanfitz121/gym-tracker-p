import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PatchNotesPage } from '@/components/patch-notes/patch-notes-page'

export const metadata = {
  title: 'Patch Notes - Plate Progress',
  description: 'Latest updates, fixes, and improvements',
}

export default async function PatchNotes() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Check if user is admin
  const { data: adminUser } = await supabase
    .from('admin_user')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return <PatchNotesPage userId={user.id} isAdmin={!!adminUser} />
}

