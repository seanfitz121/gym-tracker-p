import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET affiliate analytics - admin only
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_user')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'products' // 'products' or 'partners'

    if (type === 'products') {
      // Product-level analytics
      const { data: clicks, error: clicksError } = await supabase
        .from('affiliate_click' as any)
        .select('product_id, user_id, created_at')

      if (clicksError) throw clicksError

      // Get all products
      const { data: products, error: productsError } = await supabase
        .from('affiliate_product' as any)
        .select('id, title')

      if (productsError) throw productsError

      // Calculate stats per product
      const productStats = (products as any)?.map((product: any) => {
        const productClicks = (clicks as any)?.filter((c: any) => c.product_id === product.id) || []
        const uniqueUsers = new Set(productClicks.map((c: any) => c.user_id).filter(Boolean))
        const now = new Date()
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        const clicksLast7Days = productClicks.filter((c: any) => 
          new Date(c.created_at) >= sevenDaysAgo
        ).length
        const clicksLast30Days = productClicks.filter((c: any) => 
          new Date(c.created_at) >= thirtyDaysAgo
        ).length

        return {
          product_id: product.id,
          product_title: product.title,
          total_clicks: productClicks.length,
          unique_users: uniqueUsers.size,
          clicks_last_7_days: clicksLast7Days,
          clicks_last_30_days: clicksLast30Days
        }
      }) || []

      // Sort by total clicks descending
      productStats.sort((a: any, b: any) => b.total_clicks - a.total_clicks)

      return NextResponse.json({
        type: 'products',
        analytics: productStats
      })
    } else if (type === 'partners') {
      // Partner-level analytics
      const { data: clicks, error: clicksError } = await supabase
        .from('affiliate_click' as any)
        .select('partner_id, user_id')

      if (clicksError) throw clicksError

      // Get all partners
      const { data: partners, error: partnersError } = await supabase
        .from('affiliate_partner' as any)
        .select('id, name')

      if (partnersError) throw partnersError

      // Get product counts per partner
      const { data: products, error: productsError } = await supabase
        .from('affiliate_product' as any)
        .select('partner_id, active')

      if (productsError) throw productsError

      const partnerStats = (partners as any)?.map((partner: any) => {
        const partnerClicks = (clicks as any)?.filter((c: any) => c.partner_id === partner.id) || []
        const uniqueUsers = new Set(partnerClicks.map((c: any) => c.user_id).filter(Boolean))
        const partnerProducts = (products as any)?.filter((p: any) => 
          p.partner_id === partner.id && p.active
        ) || []

        return {
          partner_id: partner.id,
          partner_name: partner.name,
          total_clicks: partnerClicks.length,
          unique_users: uniqueUsers.size,
          products_count: partnerProducts.length
        }
      }) || []

      // Sort by total clicks descending
      partnerStats.sort((a: any, b: any) => b.total_clicks - a.total_clicks)

      return NextResponse.json({
        type: 'partners',
        analytics: partnerStats
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Use "products" or "partners"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error fetching affiliate analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

