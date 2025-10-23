import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BlogPage } from '@/components/blog/blog-page'

export const metadata = {
  title: 'Blog - Plate Progress',
  description: 'Fitness tips, training insights, and workout advice',
}

export default async function Blog() {
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

  return <BlogPage userId={user.id} isAdmin={!!adminUser} />
}

