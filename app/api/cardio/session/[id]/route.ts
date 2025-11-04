import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CardioSessionFormData } from '@/lib/types/cardio'
import { distanceToMeters, calculatePace, estimateCalories } from '@/lib/utils/cardio-calculations'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// GET /api/cardio/session/[id] - Get single session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: session, error } = await supabase
      .from('cardio_session')
      .select(`
        *,
        cardio_interval (*)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching cardio session:', error)
      return NextResponse.json(
        { error: 'Failed to fetch cardio session' },
        { status: 500 }
      )
    }

    return NextResponse.json(session, { headers: corsHeaders })
  } catch (error) {
    console.error('Unexpected error in GET /api/cardio/session/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/cardio/session/[id] - Update session
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify ownership
    const { data: existingSession } = await supabase
      .from('cardio_session')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    const body: Partial<CardioSessionFormData> = await request.json()
    
    const updateData: any = {}

    if (body.cardio_type) updateData.cardio_type = body.cardio_type
    if (body.mode) updateData.mode = body.mode
    if (body.total_duration !== undefined) updateData.total_duration = body.total_duration
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.avg_hr !== undefined) updateData.avg_hr = body.avg_hr
    if (body.max_hr !== undefined) updateData.max_hr = body.max_hr

    if (body.total_distance !== undefined) {
      updateData.total_distance = body.total_distance
        ? distanceToMeters(body.total_distance, body.distance_unit || 'km')
        : null
    }

    if (body.avg_pace !== undefined) {
      updateData.avg_pace = body.avg_pace
    } else if (updateData.total_distance && updateData.total_duration) {
      updateData.avg_pace = calculatePace(updateData.total_distance, updateData.total_duration)
    }

    if (body.calories !== undefined) {
      updateData.calories = body.calories
    }

    const { data: session, error } = await supabase
      .from('cardio_session')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating cardio session:', error)
      return NextResponse.json(
        { error: 'Failed to update cardio session' },
        { status: 500 }
      )
    }

    // Update intervals if provided
    if (body.intervals) {
      // Delete existing intervals
      await supabase
        .from('cardio_interval')
        .delete()
        .eq('session_id', id)

      // Insert new intervals
      if (body.intervals.length > 0) {
        const intervals = body.intervals.map((interval, index) => {
          const distanceMeters = interval.distance
            ? distanceToMeters(interval.distance, interval.distance_unit || 'km')
            : null

          let intervalPace = interval.avg_pace
          if (distanceMeters && interval.duration && !intervalPace) {
            intervalPace = calculatePace(distanceMeters, interval.duration)
          }

          return {
            session_id: id,
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

        await supabase.from('cardio_interval').insert(intervals)
      }
    }

    // Fetch updated session
    const { data: fullSession } = await supabase
      .from('cardio_session')
      .select(`
        *,
        cardio_interval (*)
      `)
      .eq('id', id)
      .single()

    return NextResponse.json(fullSession || session, { headers: corsHeaders })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/cardio/session/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/cardio/session/[id] - Delete session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify ownership and delete (cascade will delete intervals)
    const { error } = await supabase
      .from('cardio_session')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting cardio session:', error)
      return NextResponse.json(
        { error: 'Failed to delete cardio session' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/cardio/session/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

