import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CardioSessionFormData } from '@/lib/types/cardio'
import { distanceToMeters, calculatePace, estimateCalories } from '@/lib/utils/cardio-calculations'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// GET /api/cardio/session - List cardio sessions
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const cardioType = searchParams.get('type')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    let query = supabase
      .from('cardio_session')
      .select(`
        *,
        cardio_interval (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range((page - 1) * limit, page * limit - 1)

    if (cardioType) {
      query = query.eq('cardio_type', cardioType)
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: sessions, error } = await query

    if (error) {
      console.error('Error fetching cardio sessions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch cardio sessions' },
        { status: 500 }
      )
    }

    return NextResponse.json(sessions || [], { headers: corsHeaders })
  } catch (error) {
    console.error('Unexpected error in GET /api/cardio/session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/cardio/session - Create a new cardio session
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: CardioSessionFormData = await request.json()
    
    // Convert distance to meters
    const totalDistanceMeters = body.total_distance
      ? distanceToMeters(body.total_distance, body.distance_unit)
      : null

    // Calculate pace if distance and duration are provided
    let avgPace = body.avg_pace
    if (totalDistanceMeters && body.total_duration && !avgPace) {
      avgPace = calculatePace(totalDistanceMeters, body.total_duration)
    }

    // Get user weight for calorie estimation (optional)
    // Get the most recent weight log entry
    const { data: weightLog } = await supabase
      .from('weight_log')
      .select('weight, unit')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })
      .limit(1)
      .single()

    // Convert to kg if needed, default to 70kg
    let weightKg = 70
    if (weightLog) {
      if (weightLog.unit === 'lb') {
        weightKg = weightLog.weight * 0.453592 // Convert lb to kg
      } else {
        weightKg = weightLog.weight
      }
    }

    // Estimate calories if not provided
    let calories = body.calories
    if (!calories && body.total_duration > 0) {
      calories = estimateCalories(
        body.cardio_type,
        body.total_duration,
        weightKg,
        totalDistanceMeters,
        body.avg_hr
      )
    }

    // Insert session
    const { data: session, error: sessionError } = await supabase
      .from('cardio_session')
      .insert({
        user_id: user.id,
        cardio_type: body.cardio_type,
        mode: body.mode,
        total_duration: body.total_duration,
        total_distance: totalDistanceMeters,
        avg_pace: avgPace,
        calories,
        avg_hr: body.avg_hr,
        max_hr: body.max_hr,
        notes: body.notes,
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Error creating cardio session:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create cardio session' },
        { status: 500 }
      )
    }

    // Insert intervals if provided
    if (body.intervals && body.intervals.length > 0) {
      const intervals = body.intervals.map((interval, index) => {
        const distanceMeters = interval.distance
          ? distanceToMeters(interval.distance, interval.distance_unit)
          : null

        let intervalPace = interval.avg_pace
        if (distanceMeters && interval.duration && !intervalPace) {
          intervalPace = calculatePace(distanceMeters, interval.duration)
        }

        return {
          session_id: session.id,
          label: interval.label,
          duration: interval.duration,
          distance: distanceMeters,
          avg_pace: intervalPace,
          incline: interval.incline,
          resistance: interval.resistance,
          avg_hr: interval.avg_hr,
          max_hr: interval.max_hr,
          rpe: interval.rpe,
          order_index: index,
        }
      })

      const { error: intervalsError } = await supabase
        .from('cardio_interval')
        .insert(intervals)

      if (intervalsError) {
        console.error('Error creating cardio intervals:', intervalsError)
        // Continue anyway - session is created
      }
    }

    // Fetch full session with intervals
    const { data: fullSession, error: fetchError } = await supabase
      .from('cardio_session')
      .select(`
        *,
        cardio_interval (*)
      `)
      .eq('id', session.id)
      .single()

    if (fetchError) {
      console.error('Error fetching created session:', fetchError)
      return NextResponse.json(session, { headers: corsHeaders })
    }

    return NextResponse.json(fullSession, { headers: corsHeaders, status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/cardio/session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

