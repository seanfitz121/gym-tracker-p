import { AdminProductManager } from '@/components/affiliate/admin-product-manager'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Admin - Affiliate Shop | Plate Progress',
  description: 'Manage affiliate products and view analytics',
}

export default async function AdminAffiliateShopPage() {
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

  if (!adminUser) {
    redirect('/app/dashboard')
  }

  return <AdminProductManager />
}

