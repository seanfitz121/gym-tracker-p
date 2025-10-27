import { createClient } from '../supabase/client'
import type { ActiveWorkout, ActiveSet } from '../types'

// Anti-cheat validation thresholds
const MAX_XP_PER_HOUR = 2000
const MAX_VOLUME_KG_PER_SESSION = 50000 // 50 tons
const MAX_WEIGHT_KG = 500 // 500kg for any single set
const MIN_SET_DURATION_MS = 2000 // Minimum 2s between sets
const MAX_SETS_PER_SESSION = 500

interface AntiCheatResult {
  passed: boolean
  flags: string[]
  severity: 'low' | 'medium' | 'high'
}

export async function validateWorkout(
  userId: string,
  workout: ActiveWorkout
): Promise<AntiCheatResult> {
  const flags: string[] = []
  let severity: 'low' | 'medium' | 'high' = 'low'

  // Count total sets
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0) +
    (workout.blocks?.reduce((sum, block) => 
      sum + block.exercises.reduce((exSum, ex) => exSum + ex.sets.length, 0), 0) || 0)

  if (totalSets > MAX_SETS_PER_SESSION) {
    flags.push(`Excessive sets: ${totalSets} (max ${MAX_SETS_PER_SESSION})`)
    severity = 'high'
  }

  // Calculate total volume
  let totalVolumeKg = 0
  const allSets: ActiveSet[] = []

  workout.exercises.forEach(ex => {
    ex.sets.forEach(set => {
      allSets.push(set)
      const weightKg = set.weightUnit === 'lb' ? set.weight * 0.453592 : set.weight
      totalVolumeKg += weightKg * set.reps
    })
  })

  workout.blocks?.forEach(block => {
    block.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        allSets.push(set)
        const weightKg = set.weightUnit === 'lb' ? set.weight * 0.453592 : set.weight
        totalVolumeKg += weightKg * set.reps
      })
    })
  })

  if (totalVolumeKg > MAX_VOLUME_KG_PER_SESSION) {
    flags.push(`Excessive volume: ${Math.round(totalVolumeKg)}kg (max ${MAX_VOLUME_KG_PER_SESSION}kg)`)
    severity = 'high'
  }

  // Check for impossible weights
  allSets.forEach((set, index) => {
    const weightKg = set.weightUnit === 'lb' ? set.weight * 0.453592 : set.weight
    if (weightKg > MAX_WEIGHT_KG) {
      flags.push(`Impossible weight on set ${index + 1}: ${weightKg.toFixed(1)}kg (max ${MAX_WEIGHT_KG}kg)`)
      severity = severity === 'high' ? 'high' : 'medium'
    }
  })

  // Check workout duration and XP rate
  const startedAt = typeof workout.startedAt === 'string' 
    ? new Date(workout.startedAt) 
    : workout.startedAt
  const durationMs = Date.now() - startedAt.getTime()
  const durationHours = durationMs / (1000 * 60 * 60)

  // Basic XP calculation (5 XP per set, bonus for volume)
  const estimatedXP = totalSets * 5
  const xpPerHour = estimatedXP / durationHours

  if (xpPerHour > MAX_XP_PER_HOUR) {
    flags.push(`High XP rate: ${Math.round(xpPerHour)} XP/hour (max ${MAX_XP_PER_HOUR})`)
    severity = severity === 'high' ? 'high' : 'medium'
  }

  // Note: Historical pattern checking (volume spike detection) is disabled
  // because workout_session doesn't store total_volume_kg - it would need to be 
  // calculated from set_entry table which would be too expensive for validation

  // Check account age (new user throttling)
  const supabase = createClient()
  const { data: profile } = await supabase
    .from('profile')
    .select('account_verified_at')
    .eq('user_id', userId)
    .single()

  const accountAge = profile?.account_verified_at 
    ? Date.now() - new Date(profile.account_verified_at).getTime()
    : 0

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
  if (accountAge < sevenDaysMs && totalVolumeKg > 10000) {
    flags.push('New account with high volume')
    severity = severity === 'high' ? 'high' : 'medium'
  }

  return {
    passed: flags.length === 0,
    flags,
    severity
  }
}

export async function createAntiCheatFlag(
  userId: string,
  flagType: string,
  severity: 'low' | 'medium' | 'high',
  details: any
): Promise<void> {
  const supabase = createClient()
  
  await supabase
    .from('anti_cheat_flag')
    .insert({
      user_id: userId,
      flag_type: flagType,
      severity,
      status: 'pending',
      details
    })
}

