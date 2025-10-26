import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// CORS headers for OPTIONS requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// GET /api/weight - List all weight logs for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters for filtering/sorting
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 365
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    // Build query
    let query = supabase
      .from('weight_log')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })
      .limit(limit)

    // Apply date filters if provided
    if (startDate) {
      query = query.gte('logged_at', startDate)
    }
    if (endDate) {
      query = query.lte('logged_at', endDate)
    }

    const { data: logs, error } = await query

    if (error) {
      console.error('Error fetching weight logs:', error)
      return NextResponse.json(
        { error: 'Failed to fetch weight logs' },
        { status: 500 }
      )
    }

    return NextResponse.json(logs || [], { headers: corsHeaders })
  } catch (error) {
    console.error('Unexpected error in GET /api/weight:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/weight - Create a new weight log entry
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { weight, unit, logged_at } = body

    // Validation
    if (!weight || typeof weight !== 'number' || weight <= 0) {
      return NextResponse.json(
        { error: 'Invalid weight value' },
        { status: 400 }
      )
    }

    if (!unit || !['kg', 'lb'].includes(unit)) {
      return NextResponse.json(
        { error: 'Invalid unit. Must be "kg" or "lb"' },
        { status: 400 }
      )
    }

    if (!logged_at || !/^\d{4}-\d{2}-\d{2}$/.test(logged_at)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    // Insert weight log
    const { data: log, error } = await supabase
      .from('weight_log')
      .insert({
        user_id: user.id,
        weight,
        unit,
        logged_at,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating weight log:', error)
      
      // Check for duplicate date error
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'You already have a weight entry for this date' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to create weight log' },
        { status: 500 }
      )
    }

    return NextResponse.json(log, { status: 201, headers: corsHeaders })
  } catch (error) {
    console.error('Unexpected error in POST /api/weight:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


