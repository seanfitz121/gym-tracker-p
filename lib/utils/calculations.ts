/**
 * Calculate estimated 1RM using Brzycki formula
 * Formula: 1RM = Weight / (1.0278 - 0.0278 × Reps)
 * Clips reps between 1-12 for sanity
 */
export function calculateEstimated1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0
  
  // Clip reps for sanity
  const clippedReps = Math.max(1, Math.min(12, reps))
  
  // Brzycki formula
  const estimated1RM = weight / (1.0278 - 0.0278 * clippedReps)
  
  // Round to 1 decimal place
  return Math.round(estimated1RM * 10) / 10
}

/**
 * Calculate total volume for a set (reps * weight)
 */
export function calculateSetVolume(reps: number, weight: number): number {
  return reps * weight
}

/**
 * Calculate total volume for multiple sets
 */
export function calculateTotalVolume(sets: Array<{ reps: number; weight: number; is_warmup?: boolean | null }>): number {
  return sets
    .filter(set => !set.is_warmup)
    .reduce((total, set) => total + calculateSetVolume(set.reps, set.weight), 0)
}

/**
 * Convert weight between kg and lb
 */
export function convertWeight(weight: number, from: 'kg' | 'lb', to: 'kg' | 'lb'): number {
  if (from === to) return weight
  
  if (from === 'kg' && to === 'lb') {
    return Math.round(weight * 2.20462 * 100) / 100
  }
  
  // from === 'lb' && to === 'kg'
  return Math.round(weight / 2.20462 * 100) / 100
}

/**
 * Calculate level from total XP
 * Level curve: level = floor(0.1 * sqrt(totalXP))
 */
export function calculateLevel(totalXP: number): number {
  return Math.floor(0.1 * Math.sqrt(totalXP))
}

/**
 * Calculate XP needed for next level
 */
export function calculateXPForNextLevel(currentLevel: number): number {
  const nextLevel = currentLevel + 1
  return Math.pow(nextLevel / 0.1, 2)
}

/**
 * Calculate XP progress to next level (0-1)
 */
export function calculateXPProgress(totalXP: number): number {
  const currentLevel = calculateLevel(totalXP)
  const currentLevelXP = Math.pow(currentLevel / 0.1, 2)
  const nextLevelXP = calculateXPForNextLevel(currentLevel)
  
  return (totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)
}

/**
 * Format duration in seconds to human readable string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

/**
 * Calculate duration between two dates in seconds
 */
export function calculateSessionDuration(startedAt: Date | string, endedAt: Date | string | null): number {
  const start = typeof startedAt === 'string' ? new Date(startedAt) : startedAt
  const end = endedAt ? (typeof endedAt === 'string' ? new Date(endedAt) : endedAt) : new Date()
  
  return Math.floor((end.getTime() - start.getTime()) / 1000)
}

/**
 * Check if two dates are on the same day (accounting for local midnight)
 */
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate()
}

/**
 * Check if date is within N days of another date
 */
export function isWithinDays(date: Date | string, referenceDate: Date | string, days: number): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const ref = typeof referenceDate === 'string' ? new Date(referenceDate) : referenceDate
  
  const diffMs = Math.abs(d.getTime() - ref.getTime())
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  
  return diffDays <= days
}

/**
 * Get days between two dates
 */
export function getDaysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2
  
  const diffMs = Math.abs(d1.getTime() - d2.getTime())
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

