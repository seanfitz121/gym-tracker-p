import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET all products (including inactive) - admin only
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
    const active = searchParams.get('active')

    let query = supabase
      .from('affiliate_product' as any)
      .select(`
        *,
        partner:affiliate_partner(*)
      `)
      .order('created_at', { ascending: false })

    if (active !== null) {
      query = query.eq('active', active === 'true')
    }

    const { data: products, error } = await query

    if (error) throw error

    return NextResponse.json({ products: products || [] })
  } catch (error) {
    console.error('Error fetching affiliate products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create new product - admin only
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      title,
      subtitle,
      image_url,
      price_hint,
      origin,
      partner_id,
      affiliate_url,
      tags = [],
      active = true,
      rating,
      description,
      shipping_note
    } = body

    // Validate required fields
    if (!title || !origin || !affiliate_url) {
      return NextResponse.json(
        { error: 'Title, origin, and affiliate_url are required' },
        { status: 400 }
      )
    }

    // Validate affiliate_url format
    try {
      new URL(affiliate_url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid affiliate_url format' },
        { status: 400 }
      )
    }

    // Sanitize tags (ensure array, filter empty strings)
    const sanitizedTags = Array.isArray(tags)
      ? tags.filter(t => t && typeof t === 'string').map(t => t.trim())
      : []

    // Create product
    const { data: product, error: insertError } = await supabase
      .from('affiliate_product' as any)
      .insert({
        title: title.trim(),
        subtitle: subtitle?.trim() || null,
        image_url: image_url?.trim() || null,
        price_hint: price_hint?.trim() || null,
        origin: origin.trim(),
        partner_id: partner_id || null,
        affiliate_url: affiliate_url.trim(),
        tags: sanitizedTags,
        active: active ?? true,
        rating: rating && rating >= 0 && rating <= 5 ? rating : null,
        description: description?.trim() || null,
        shipping_note: shipping_note?.trim() || null
      })
      .select(`
        *,
        partner:affiliate_partner(*)
      `)
      .single()

    if (insertError) {
      console.error('Error creating product:', insertError)
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/admin/affiliate/products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

