import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// This endpoint should be called daily by a cron job (Vercel Cron, or external scheduler)
// Aggregates workout data into weekly_xp table for fast leaderboard queries

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized calls
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get current ISO week
    const now = new Date()
    const year = now.getFullYear()
    const week = Math.ceil(((now.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + new Date(year, 0, 1).getDay() + 1) / 7)
    const isoWeek = year * 100 + week

    // Get all users who logged workouts this week
    const startOfWeek = new Date(now)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const { data: sessions, error: sessionsError } = await supabase
      .from('workout_session')
      .select('id, user_id, created_at')
      .gte('created_at', startOfWeek.toISOString())

    if (sessionsError) throw sessionsError

    // Get set entries for all sessions to calculate volume and XP
    const sessionIds = sessions?.map(s => s.id) || []
    const { data: setEntries } = await supabase
      .from('set_entry')
      .select('session_id, weight, reps, weight_unit, is_warmup')
      .in('session_id', sessionIds)

    // Calculate volume for each session
    const sessionVolumes = new Map<string, number>()
    setEntries?.forEach(set => {
      const weightInKg = set.weight_unit === 'lb' ? set.weight * 0.453592 : set.weight
      const volume = weightInKg * set.reps
      sessionVolumes.set(set.session_id, (sessionVolumes.get(set.session_id) || 0) + volume)
    })

    // Group by user
    const userStats = new Map<string, { xp: number, workouts: number, volume: number }>()

    sessions?.forEach(session => {
      const volume = sessionVolumes.get(session.id) || 0
      // Calculate XP: base 100 per workout + 1 XP per kg of volume
      const xp = 100 + Math.floor(volume)
      
      const existing = userStats.get(session.user_id) || { xp: 0, workouts: 0, volume: 0 }
      userStats.set(session.user_id, {
        xp: existing.xp + xp,
        workouts: existing.workouts + 1,
        volume: existing.volume + volume
      })
    })

    // Get PR counts for this week
    const { data: prs } = await supabase
      .from('personal_record')
      .select('user_id')
      .gte('achieved_at', startOfWeek.toISOString())

    const prCounts = new Map<string, number>()
    prs?.forEach(pr => {
      prCounts.set(pr.user_id, (prCounts.get(pr.user_id) || 0) + 1)
    })

    // Get gym memberships for users
    const userIds = Array.from(userStats.keys())
    const { data: gymMemberships } = await supabase
      .from('gym_member')
      .select('user_id, gym_code')
      .in('user_id', userIds)
      .eq('opt_in', true)
      .eq('is_approved', true)

    const userGyms = new Map<string, string>()
    gymMemberships?.forEach(gm => {
      userGyms.set(gm.user_id, gm.gym_code)
    })

    // Upsert weekly_xp records
    const updates = Array.from(userStats.entries()).map(([userId, stats]) => ({
      user_id: userId,
      iso_week: isoWeek,
      xp: stats.xp,
      workouts: stats.workouts,
      volume_kg: Math.round(stats.volume),
      pr_count: prCounts.get(userId) || 0,
      gym_code: userGyms.get(userId) || null,
      updated_at: new Date().toISOString()
    }))

    if (updates.length > 0) {
      const { error: upsertError } = await supabase
        .from('weekly_xp')
        .upsert(updates, {
          onConflict: 'user_id,iso_week'
        })

      if (upsertError) throw upsertError
    }

    console.log(`Aggregated weekly XP for ${updates.length} users (week ${isoWeek})`)

    return NextResponse.json({
      success: true,
      iso_week: isoWeek,
      users_updated: updates.length
    })
  } catch (error) {
    console.error('Error aggregating weekly XP:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Manual trigger (for testing/admin use)
export async function GET(request: NextRequest) {
  // Same logic but requires admin auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is admin
  const { data: adminUser } = await supabase
    .from('admin_user')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!adminUser) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  // Call the POST handler
  return POST(request)
}

