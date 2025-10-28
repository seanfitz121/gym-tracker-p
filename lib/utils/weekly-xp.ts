import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Get current ISO week in YYYYWW format
 * Must match the calculation in the cron job and leaderboard API
 */
export function getIsoWeek(date: Date = new Date()): number {
  const year = date.getFullYear()
  const week = Math.ceil(
    ((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 
    new Date(year, 0, 1).getDay() + 1) / 7
  )
  return year * 100 + week
}

/**
 * Get start of current week (Sunday at 00:00:00)
 */
export function getStartOfWeek(date: Date = new Date()): Date {
  const startOfWeek = new Date(date)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  return startOfWeek
}

/**
 * Update weekly_xp for a user after a workout is completed
 * This provides real-time leaderboard updates without waiting for the cron job
 */
export async function updateWeeklyXp(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string
): Promise<void> {
  try {
    const isoWeek = getIsoWeek()
    const startOfWeek = getStartOfWeek()

    // Get all sessions for this user this week
    const { data: sessions, error: sessionsError } = await supabase
      .from('workout_session')
      .select('id, created_at')
      .eq('user_id', userId)
      .gte('created_at', startOfWeek.toISOString())

    if (sessionsError) throw sessionsError

    const sessionIds = sessions?.map(s => s.id) || []
    
    if (sessionIds.length === 0) {
      console.warn('No sessions found for user this week')
      return
    }

    // Get set entries for all sessions to calculate volume
    const { data: setEntries, error: setsError } = await supabase
      .from('set_entry')
      .select('session_id, weight, reps, weight_unit, is_warmup')
      .in('session_id', sessionIds)

    if (setsError) throw setsError

    // Calculate volume for each session
    const sessionVolumes = new Map<string, number>()
    setEntries?.forEach(set => {
      if (set.is_warmup) return // Skip warmup sets
      
      const weightInKg = set.weight_unit === 'lb' ? set.weight * 0.453592 : set.weight
      const volume = weightInKg * set.reps
      sessionVolumes.set(
        set.session_id,
        (sessionVolumes.get(set.session_id) || 0) + volume
      )
    })

    // Calculate total stats
    let totalXp = 0
    let totalVolume = 0
    const workoutCount = sessionIds.length

    sessionIds.forEach(id => {
      const volume = sessionVolumes.get(id) || 0
      totalVolume += volume
      // XP calculation: base 100 per workout + 1 XP per kg of volume
      totalXp += 100 + Math.floor(volume)
    })

    // Get PR count for this week
    const { data: prs, error: prsError } = await supabase
      .from('personal_record')
      .select('id')
      .eq('user_id', userId)
      .gte('achieved_at', startOfWeek.toISOString())

    if (prsError) throw prsError

    const prCount = prs?.length || 0

    // Get user's gym if they have one
    const { data: gymMembership } = await supabase
      .from('gym_member')
      .select('gym_code')
      .eq('user_id', userId)
      .eq('opt_in', true)
      .eq('is_approved', true)
      .maybeSingle()

    const gymCode = gymMembership?.gym_code || null

    // Upsert weekly_xp record
    const { error: upsertError } = await supabase
      .from('weekly_xp')
      .upsert({
        user_id: userId,
        iso_week: isoWeek,
        xp: totalXp,
        workouts: workoutCount,
        volume_kg: Math.round(totalVolume),
        pr_count: prCount,
        gym_code: gymCode,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,iso_week'
      })

    if (upsertError) throw upsertError

    console.log(`Updated weekly_xp for user ${userId}: ${totalXp} XP, ${workoutCount} workouts, ${Math.round(totalVolume)} kg`)
  } catch (error) {
    console.error('Error updating weekly_xp:', error)
    // Don't throw - this is a background update and shouldn't block workout saving
  }
}

