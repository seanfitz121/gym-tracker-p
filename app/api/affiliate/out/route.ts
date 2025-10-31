import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET redirect endpoint with click tracking
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const productId = searchParams.get('productId')
    const partnerId = searchParams.get('pid')
    const campaign = searchParams.get('campaign')

    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      )
    }

    // Get product and its affiliate URL
    const { data: product, error: productError } = await supabase
      .from('affiliate_product' as any)
      .select('affiliate_url, partner_id, origin')
      .eq('id', productId)
      .eq('active', true)
      .single()

    if (productError || !product) {
      console.error('Error fetching product:', productError)
      return NextResponse.json(
        { error: 'Product not found or inactive' },
        { status: 404 }
      )
    }

    // Get user if authenticated
    const { data: { user } } = await supabase.auth.getUser()

    // Get request metadata for tracking
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwardedFor?.split(',')[0]?.trim() || realIp || null
    const userAgent = request.headers.get('user-agent') || null

    const productData = product as any

    // Log the click
    const { error: clickError } = await supabase
      .from('affiliate_click' as any)
      .insert({
        user_id: user?.id || null,
        product_id: productId,
        partner_id: partnerId || productData.partner_id || null,
        ip: ip || null,
        user_agent: userAgent,
        campaign: campaign || null
      })

    if (clickError) {
      console.error('Error logging click:', clickError)
      // Continue anyway - don't fail the redirect
    }

    // Get affiliate URL and append UTM params if provided
    let affiliateUrl = productData.affiliate_url

    // Add UTM params if campaign provided
    if (campaign) {
      const url = new URL(affiliateUrl)
      url.searchParams.set('utm_source', 'plateprogress')
      url.searchParams.set('utm_medium', 'affiliate')
      url.searchParams.set('utm_campaign', campaign)
      affiliateUrl = url.toString()
    }

    // Redirect to affiliate URL
    return NextResponse.redirect(affiliateUrl, {
      status: 302,
      headers: {
        'Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error('Error in GET /api/affiliate/out:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

