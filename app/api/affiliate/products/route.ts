import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// GET affiliate products with filters and sorting
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    // Check if user is admin (to show inactive products)
    let isAdmin = false
    if (user) {
      const { data: adminUser } = await supabase
        .from('admin_user')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      
      isAdmin = !!adminUser
    }

    // Query parameters
    const origin = searchParams.get('origin')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('affiliate_product' as any)
      .select(`
        *,
        partner:affiliate_partner(*)
      `, { count: 'exact' })

    // Filter active products unless admin
    if (!isAdmin) {
      query = query.eq('active', true)
    }

    // Apply filters
    if (origin) {
      query = query.eq('origin', origin)
    }

    if (tags && tags.length > 0) {
      query = query.contains('tags', tags)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,subtitle.ilike.%${search}%`)
    }

    // Apply sorting
    if (sortBy === 'price') {
      // Sort by price_hint (string, so this is approximate)
      query = query.order('price_hint', { ascending: sortOrder === 'asc' })
    } else if (sortBy === 'rating') {
      query = query.order('rating', { ascending: sortOrder === 'asc', nullsFirst: false })
    } else {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: products, error, count } = await query

    if (error) {
      console.error('Error fetching affiliate products:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: corsHeaders }
      )
    }

    // Get unique origins for filter options
    const { data: origins } = await supabase
      .from('affiliate_product' as any)
      .select('origin')
      .eq('active', true)
      .not('origin', 'is', null)

    const uniqueOrigins = [...new Set((origins as any)?.map((o: any) => o.origin) || [])]

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      products: products || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      },
      filters: {
        availableOrigins: uniqueOrigins
      }
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Error in GET /api/affiliate/products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}

