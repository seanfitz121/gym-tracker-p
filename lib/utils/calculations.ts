/**
 * Calculate estimated 1RM using Brzycki formula
 * Formula: 1RM = Weight / (1.0278 - 0.0278 × Reps)
 * Clips reps between 1-12 for sanity
 * @deprecated Use estimate1RM with formula='brzycki' instead
 */
export function calculateEstimated1RM(weight: number, reps: number): number {
  return estimate1RM(weight, reps, 'brzycki')
}

/**
 * Calculate estimated 1RM using specified formula
 * @param weight - Weight lifted
 * @param reps - Number of reps (1-20)
 * @param formula - Formula to use (epley, brzycki, lombardi)
 * @returns Estimated 1RM
 */
export function estimate1RM(
  weight: number, 
  reps: number, 
  formula: 'epley' | 'brzycki' | 'lombardi' = 'epley'
): number {
  if (weight <= 0 || reps < 1 || reps > 20) return 0
  
  // If reps = 1, the 1RM is just the weight
  if (reps === 1) return weight
  
  let estimated1RM: number
  
  switch (formula) {
    case 'epley':
      // Epley: w * (1 + reps/30)
      estimated1RM = weight * (1 + reps / 30)
      break
      
    case 'brzycki':
      // Brzycki: w * (36 / (37 - reps))
      estimated1RM = weight * (36 / (37 - reps))
      break
      
    case 'lombardi':
      // Lombardi: w * reps^0.10
      estimated1RM = weight * Math.pow(reps, 0.10)
      break
      
    default:
      estimated1RM = weight * (1 + reps / 30)
  }
  
  // Round to 2 decimal places
  return Math.round(estimated1RM * 100) / 100
}

/**
 * Round weight to specified increment
 * @param value - Weight to round
 * @param rounding - Rounding increment (e.g., 0.5 for kg, 2.5 for lb)
 * @returns Rounded weight
 */
export function roundWeight(value: number, rounding: number): number {
  return Math.round(value / rounding) * rounding
}

/**
 * Get default rounding for unit
 * @param unit - Weight unit
 * @returns Default rounding increment
 */
export function getDefaultRounding(unit: 'kg' | 'lb'): number {
  return unit === 'kg' ? 0.5 : 2.5
}

/**
 * Generate percentage table for 1RM
 * @param estimated1RM - Calculated 1RM
 * @param step - Step size for percentages (5 or 10)
 * @param rounding - Rounding increment (optional, uses default based on unit)
 * @param unit - Weight unit for default rounding
 * @returns Array of percentage table entries
 */
export function generatePercentageTable(
  estimated1RM: number,
  step: number = 10,
  rounding?: number,
  unit: 'kg' | 'lb' = 'kg'
): Array<{ percent: number; weight: number }> {
  const roundingIncrement = rounding ?? getDefaultRounding(unit)
  const table: Array<{ percent: number; weight: number }> = []
  
  // Generate from 50% to 100% 
  const start = step === 5 ? 50 : 50
  const end = 100
  
  for (let percent = end; percent >= start; percent -= step) {
    const rawWeight = (estimated1RM * percent) / 100
    const roundedWeight = roundWeight(rawWeight, roundingIncrement)
    
    table.push({
      percent,
      weight: roundedWeight
    })
  }
  
  return table
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

