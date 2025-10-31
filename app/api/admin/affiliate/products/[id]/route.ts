import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET single product - admin only
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    const { data: product, error } = await supabase
      .from('affiliate_product' as any)
      .select(`
        *,
        partner:affiliate_partner(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT update product - admin only
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()

    const {
      title,
      subtitle,
      image_url,
      price_hint,
      origin,
      partner_id,
      affiliate_url,
      tags,
      active,
      rating,
      description,
      shipping_note
    } = body

    // Build update object
    const updateData: any = {}

    if (title !== undefined) updateData.title = title.trim()
    if (subtitle !== undefined) updateData.subtitle = subtitle?.trim() || null
    if (image_url !== undefined) updateData.image_url = image_url?.trim() || null
    if (price_hint !== undefined) updateData.price_hint = price_hint?.trim() || null
    if (origin !== undefined) updateData.origin = origin.trim()
    if (partner_id !== undefined) updateData.partner_id = partner_id || null
    if (affiliate_url !== undefined) {
      // Validate URL
      try {
        new URL(affiliate_url)
        updateData.affiliate_url = affiliate_url.trim()
      } catch {
        return NextResponse.json(
          { error: 'Invalid affiliate_url format' },
          { status: 400 }
        )
      }
    }
    if (tags !== undefined) {
      const sanitizedTags = Array.isArray(tags)
        ? tags.filter(t => t && typeof t === 'string').map(t => t.trim())
        : []
      updateData.tags = sanitizedTags
    }
    if (active !== undefined) updateData.active = active
    if (rating !== undefined) {
      updateData.rating = rating && rating >= 0 && rating <= 5 ? rating : null
    }
    if (description !== undefined) updateData.description = description?.trim() || null
    if (shipping_note !== undefined) updateData.shipping_note = shipping_note?.trim() || null

    // Validate required fields if provided
    if (updateData.origin && !updateData.origin.trim()) {
      return NextResponse.json(
        { error: 'Origin cannot be empty' },
        { status: 400 }
      )
    }

    if (updateData.affiliate_url && !updateData.affiliate_url.trim()) {
      return NextResponse.json(
        { error: 'Affiliate URL cannot be empty' },
        { status: 400 }
      )
    }

    const { data: product, error } = await supabase
      .from('affiliate_product' as any)
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        partner:affiliate_partner(*)
      `)
      .single()

    if (error) {
      console.error('Error updating product:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error in PUT /api/admin/affiliate/products/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE product - admin only
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    const { error } = await supabase
      .from('affiliate_product' as any)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting product:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/affiliate/products/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

