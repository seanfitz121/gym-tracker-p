import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/one-rm/goals - Fetch user's 1RM goals
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const exerciseId = searchParams.get('exercise_id')

    let query = supabase
      .from('one_rm_goal')
      .select(`
        *,
        exercise:exercise(name, body_part)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (exerciseId) {
      query = query.eq('exercise_id', exerciseId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching 1RM goals:', error)
      // If table doesn't exist, return empty array instead of crashing
      if (error.code === '42P01') {
        console.log('one_rm_goal table does not exist yet - returning empty array')
        return NextResponse.json([])
      }
      throw error
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('GET /api/one-rm/goals error:', error)
    // Return empty array instead of error to prevent client crashes
    return NextResponse.json([])
  }
}

// POST /api/one-rm/goals - Create or update a 1RM goal
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { exercise_id, target_weight, weight_unit, target_date } = body

    if (!exercise_id || !target_weight || !weight_unit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Use upsert to handle updates to existing goals
    const { data, error } = await supabase
      .from('one_rm_goal')
      .upsert({
        user_id: user.id,
        exercise_id,
        target_weight,
        weight_unit,
        target_date: target_date || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,exercise_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating/updating 1RM goal:', error)
      throw error
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('POST /api/one-rm/goals error:', error)
    return NextResponse.json(
      { error: 'Failed to create 1RM goal' },
      { status: 500 }
    )
  }
}

