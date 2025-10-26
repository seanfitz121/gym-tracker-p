import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { format, subDays, startOfDay } from 'date-fns'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// GET /api/hydration/stats - Get hydration statistics (streak, weekly data)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const goal_ml = searchParams.get('goal_ml') ? parseInt(searchParams.get('goal_ml')!) : 3000

    // Calculate streak using SQL function
    const { data: streakData, error: streakError } = await supabase
      .rpc('calculate_hydration_streak', {
        p_user_id: user.id,
        p_goal_ml: goal_ml
      })

    const streak = streakError ? 0 : (streakData || 0)

    // Get today's total
    const today = format(new Date(), 'yyyy-MM-dd')
    const { data: todayData, error: todayError } = await supabase
      .rpc('get_daily_hydration_total', {
        p_user_id: user.id,
        p_date: today
      })

    const today_total = todayError ? 0 : (todayData || 0)

    // Get last 7 days data for weekly summary
    const sevenDaysAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd')
    const { data: weeklyLogs, error: weeklyError } = await supabase
      .from('hydration_log')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', `${sevenDaysAgo}T00:00:00`)
      .order('logged_at', { ascending: false })

    // Calculate weekly stats
    let weekly_average = 0
    let best_day_this_week = 0

    if (!weeklyError && weeklyLogs) {
      const dailyTotals = new Map<string, number>()
      
      weeklyLogs.forEach(log => {
        const date = format(new Date(log.logged_at), 'yyyy-MM-dd')
        dailyTotals.set(date, (dailyTotals.get(date) || 0) + log.amount_ml)
      })

      const totals = Array.from(dailyTotals.values())
      weekly_average = totals.length > 0 ? totals.reduce((a, b) => a + b, 0) / 7 : 0
      best_day_this_week = totals.length > 0 ? Math.max(...totals) : 0
    }

    return NextResponse.json({
      today_total,
      today_percentage: (today_total / goal_ml) * 100,
      goal_met_today: today_total >= goal_ml,
      current_streak: streak,
      weekly_average: Math.round(weekly_average),
      best_day_this_week,
      goal_ml,
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Unexpected error in GET /api/hydration/stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


