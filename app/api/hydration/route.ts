import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// GET /api/hydration - Get hydration logs with optional date filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('start_date') // YYYY-MM-DD
    const endDate = searchParams.get('end_date') // YYYY-MM-DD
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100

    let query = supabase
      .from('hydration_log')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })
      .limit(limit)

    // Apply date filters if provided
    if (startDate) {
      query = query.gte('logged_at', `${startDate}T00:00:00`)
    }
    if (endDate) {
      query = query.lte('logged_at', `${endDate}T23:59:59`)
    }

    const { data: logs, error } = await query

    if (error) {
      console.error('Error fetching hydration logs:', error)
      return NextResponse.json({ error: 'Failed to fetch hydration logs' }, { status: 500 })
    }

    return NextResponse.json(logs || [], { headers: corsHeaders })
  } catch (error) {
    console.error('Unexpected error in GET /api/hydration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/hydration - Create a new hydration log entry
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount_ml, logged_at } = body

    // Validation
    if (!amount_ml || typeof amount_ml !== 'number' || amount_ml <= 0) {
      return NextResponse.json({ error: 'Invalid amount_ml value' }, { status: 400 })
    }

    // Insert hydration log
    const { data: log, error } = await supabase
      .from('hydration_log')
      .insert({
        user_id: user.id,
        amount_ml,
        logged_at: logged_at || new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating hydration log:', error)
      return NextResponse.json({ error: 'Failed to create hydration log' }, { status: 500 })
    }

    return NextResponse.json(log, { status: 201, headers: corsHeaders })
  } catch (error) {
    console.error('Unexpected error in POST /api/hydration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


