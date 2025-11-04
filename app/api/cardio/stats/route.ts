import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CardioStats } from '@/lib/types/cardio'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// GET /api/cardio/stats - Get aggregated cardio stats
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
    const period = searchParams.get('period') || '30' // days

    const periodDays = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    // Build base query
    let query = supabase
      .from('cardio_session')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())

    if (cardioType) {
      query = query.eq('cardio_type', cardioType)
    }

    const { data: sessions, error } = await query

    if (error) {
      console.error('Error fetching cardio stats:', error)
      return NextResponse.json(
        { error: 'Failed to fetch cardio stats' },
        { status: 500 }
      )
    }

    if (!sessions || sessions.length === 0) {
      const emptyStats: CardioStats = {
        total_sessions: 0,
        total_duration: 0,
        total_distance: 0,
        avg_pace: null,
        total_calories: null,
        best_pace: null,
        best_distance: null,
        sessions_by_type: {
          treadmill: 0,
          bike: 0,
          rower: 0,
          elliptical: 0,
          stair_climber: 0,
          ski_erg: 0,
          treadmill_incline_walk: 0,
          outdoor_run: 0,
        },
        weekly_total: 0,
        monthly_total: 0,
      }
      return NextResponse.json(emptyStats, { headers: corsHeaders })
    }

    // Calculate stats
    const totalDuration = sessions.reduce((sum, s) => sum + s.total_duration, 0)
    const totalDistance = sessions.reduce((sum, s) => sum + (s.total_distance || 0), 0)
    const totalCalories = sessions.reduce((sum, s) => sum + (s.calories || 0), 0)

    // Calculate average pace (weighted by distance)
    let totalPaceWeight = 0
    let totalPaceSum = 0
    sessions.forEach(s => {
      if (s.total_distance && s.total_distance > 0 && s.avg_pace) {
        totalPaceSum += s.avg_pace * s.total_distance
        totalPaceWeight += s.total_distance
      }
    })
    const avgPace = totalPaceWeight > 0 ? totalPaceSum / totalPaceWeight : null

    // Find best pace (fastest = lowest seconds per km)
    const sessionsWithPace = sessions.filter(s => s.avg_pace && s.avg_pace > 0)
    const bestPace = sessionsWithPace.length > 0
      ? Math.min(...sessionsWithPace.map(s => s.avg_pace!))
      : null

    // Find best distance
    const bestDistance = Math.max(...sessions.map(s => s.total_distance || 0))

    // Count sessions by type
    const sessionsByType: Record<string, number> = {
      treadmill: 0,
      bike: 0,
      rower: 0,
      elliptical: 0,
      stair_climber: 0,
      ski_erg: 0,
      treadmill_incline_walk: 0,
      outdoor_run: 0,
    }
    sessions.forEach(s => {
      if (sessionsByType.hasOwnProperty(s.cardio_type)) {
        sessionsByType[s.cardio_type]++
      }
    })

    // Calculate weekly and monthly totals
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    const weeklyTotal = sessions.filter(s => new Date(s.created_at) >= weekAgo).length
    const monthlyTotal = sessions.filter(s => new Date(s.created_at) >= monthAgo).length

    const stats: CardioStats = {
      total_sessions: sessions.length,
      total_duration: totalDuration,
      total_distance: totalDistance,
      avg_pace: avgPace,
      total_calories: totalCalories > 0 ? totalCalories : null,
      best_pace: bestPace,
      best_distance: bestDistance > 0 ? bestDistance : null,
      sessions_by_type: sessionsByType,
      weekly_total: weeklyTotal,
      monthly_total: monthlyTotal,
    }

    return NextResponse.json(stats, { headers: corsHeaders })
  } catch (error) {
    console.error('Unexpected error in GET /api/cardio/stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

