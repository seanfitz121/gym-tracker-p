import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// GET /api/weight-goal - Get user's weight goal
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: goal, error } = await supabase
      .from('weight_goal')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Error fetching weight goal:', error)
      return NextResponse.json({ error: 'Failed to fetch weight goal' }, { status: 500 })
    }

    return NextResponse.json(goal || null, { headers: corsHeaders })
  } catch (error) {
    console.error('Unexpected error in GET /api/weight-goal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/weight-goal - Create or update weight goal
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { target_weight, unit, goal_type, start_weight, target_date } = body

    if (!target_weight || !unit || !goal_type) {
      return NextResponse.json(
        { error: 'Missing required fields: target_weight, unit, goal_type' },
        { status: 400 }
      )
    }

    // Upsert (create or update)
    const { data: goal, error } = await supabase
      .from('weight_goal')
      .upsert({
        user_id: user.id,
        target_weight,
        unit,
        goal_type,
        start_weight: start_weight || null,
        start_date: new Date().toISOString().split('T')[0],
        target_date: target_date || null,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error upserting weight goal:', error)
      return NextResponse.json({ error: 'Failed to save weight goal' }, { status: 500 })
    }

    return NextResponse.json(goal, { headers: corsHeaders })
  } catch (error) {
    console.error('Unexpected error in POST /api/weight-goal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/weight-goal - Delete weight goal
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('weight_goal')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting weight goal:', error)
      return NextResponse.json({ error: 'Failed to delete weight goal' }, { status: 500 })
    }

    return NextResponse.json(
      { message: 'Weight goal deleted successfully' },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Unexpected error in DELETE /api/weight-goal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


