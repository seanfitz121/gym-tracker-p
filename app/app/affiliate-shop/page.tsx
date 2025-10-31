import { ShopPage } from '@/components/affiliate/shop-page'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Affiliate Shop | Plate Progress',
  description: 'Discover curated fitness products from trusted partners',
}

export default async function AffiliateShopPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  return <ShopPage userId={user.id} />
}

