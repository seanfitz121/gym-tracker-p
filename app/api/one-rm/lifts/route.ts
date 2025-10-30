import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/one-rm/lifts - Fetch user's 1RM lifts
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
      .from('one_rm_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })

    if (exerciseId) {
      query = query.eq('exercise_id', exerciseId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching 1RM lifts:', error)
      // If table doesn't exist, return empty array instead of crashing
      if (error.code === '42P01') {
        console.log('one_rm_progress view does not exist yet - returning empty array')
        return NextResponse.json([])
      }
      throw error
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('GET /api/one-rm/lifts error:', error)
    // Return empty array instead of error to prevent client crashes
    return NextResponse.json([])
  }
}

// POST /api/one-rm/lifts - Manually log a 1RM lift
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { exercise_id, weight, weight_unit, logged_at, notes } = body

    if (!exercise_id || !weight || !weight_unit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('one_rm_lift')
      .insert({
        user_id: user.id,
        exercise_id,
        weight,
        weight_unit,
        logged_at: logged_at || new Date().toISOString(),
        notes,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating 1RM lift:', error)
      throw error
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('POST /api/one-rm/lifts error:', error)
    return NextResponse.json(
      { error: 'Failed to create 1RM lift' },
      { status: 500 }
    )
  }
}

