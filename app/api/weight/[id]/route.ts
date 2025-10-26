import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// GET /api/weight/[id] - Get a single weight log entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: log, error } = await supabase
      .from('weight_log')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching weight log:', error)
      return NextResponse.json(
        { error: 'Weight log not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(log, { headers: corsHeaders })
  } catch (error) {
    console.error('Unexpected error in GET /api/weight/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/weight/[id] - Update a weight log entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Build update object
    const updates: any = {}
    
    if (weight !== undefined) {
      if (typeof weight !== 'number' || weight <= 0) {
        return NextResponse.json(
          { error: 'Invalid weight value' },
          { status: 400 }
        )
      }
      updates.weight = weight
    }

    if (unit !== undefined) {
      if (!['kg', 'lb'].includes(unit)) {
        return NextResponse.json(
          { error: 'Invalid unit. Must be "kg" or "lb"' },
          { status: 400 }
        )
      }
      updates.unit = unit
    }

    if (logged_at !== undefined) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(logged_at)) {
        return NextResponse.json(
          { error: 'Invalid date format. Use YYYY-MM-DD' },
          { status: 400 }
        )
      }
      updates.logged_at = logged_at
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Update weight log
    const { data: log, error } = await supabase
      .from('weight_log')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating weight log:', error)
      
      // Check for duplicate date error
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'You already have a weight entry for this date' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to update weight log' },
        { status: 500 }
      )
    }

    return NextResponse.json(log, { headers: corsHeaders })
  } catch (error) {
    console.error('Unexpected error in PUT /api/weight/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/weight/[id] - Delete a weight log entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { error } = await supabase
      .from('weight_log')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting weight log:', error)
      return NextResponse.json(
        { error: 'Failed to delete weight log' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Weight log deleted successfully' },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Unexpected error in DELETE /api/weight/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


