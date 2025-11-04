// Utility functions for cardio calculations (pace, speed, calories, PR detection)

import type { DistanceUnit } from '@/lib/types/cardio'

/**
 * Convert pace (min/km or min/mile) to speed (km/h)
 */
export function paceToSpeed(pace: number, unit: 'min/km' | 'min/mile'): number {
  if (pace <= 0) return 0
  
  if (unit === 'min/km') {
    return 60 / pace // km/h
  } else {
    // min/mile to km/h: (1 mile / pace minutes) * (60 min/hour) * (1.60934 km/mile)
    return (60 / pace) * 1.60934
  }
}

/**
 * Convert speed (km/h) to pace (min/km or min/mile)
 */
export function speedToPace(speed: number, unit: 'min/km' | 'min/mile'): number {
  if (speed <= 0) return 0
  
  if (unit === 'min/km') {
    return 60 / speed
  } else {
    // km/h to min/mile: (60 min/hour) / (speed km/h / 1.60934 km/mile)
    return 60 / (speed / 1.60934)
  }
}

/**
 * Convert distance from km or miles to meters
 */
export function distanceToMeters(distance: number, unit: DistanceUnit): number {
  if (unit === 'km') {
    return distance * 1000
  } else {
    return distance * 1609.34 // miles to meters
  }
}

/**
 * Convert distance from meters to km or miles
 */
export function metersToDistance(meters: number, unit: DistanceUnit): number {
  if (unit === 'km') {
    return meters / 1000
  } else {
    return meters / 1609.34 // meters to miles
  }
}

/**
 * Calculate pace from distance (meters) and duration (seconds)
 * Returns pace in seconds per km
 */
export function calculatePace(distanceMeters: number, durationSeconds: number): number | null {
  if (distanceMeters <= 0 || durationSeconds <= 0) return null
  return (durationSeconds / distanceMeters) * 1000 // seconds per km
}

/**
 * Format pace from seconds per km to human-readable string
 */
export function formatPace(paceSecondsPerKm: number, unit: 'min/km' | 'min/mile' = 'min/km'): string {
  if (paceSecondsPerKm <= 0) return '--'
  
  if (unit === 'min/km') {
    const minutes = Math.floor(paceSecondsPerKm / 60)
    const seconds = Math.floor(paceSecondsPerKm % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')} /km`
  } else {
    // Convert to min/mile
    const paceMinPerMile = paceSecondsPerKm * 1.60934 / 60
    const minutes = Math.floor(paceMinPerMile)
    const seconds = Math.floor((paceMinPerMile - minutes) * 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')} /mile`
  }
}

/**
 * Format duration from seconds to human-readable string
 */
export function formatDuration(durationSeconds: number): string {
  if (durationSeconds < 60) {
    return `${durationSeconds}s`
  }
  
  const hours = Math.floor(durationSeconds / 3600)
  const minutes = Math.floor((durationSeconds % 3600) / 60)
  const seconds = durationSeconds % 60
  
  if (hours > 0) {
    return `${hours}h ${minutes}m${seconds > 0 ? ` ${seconds}s` : ''}`
  } else {
    return `${minutes}m${seconds > 0 ? ` ${seconds}s` : ''}`
  }
}

/**
 * Estimate calories burned during cardio session
 * Uses METs (Metabolic Equivalent of Task) values
 * Formula: METs × weight (kg) × duration (hours)
 */
export function estimateCalories(
  cardioType: string,
  durationSeconds: number,
  weightKg: number,
  distanceMeters?: number | null,
  avgHr?: number | null
): number | null {
  if (weightKg <= 0 || durationSeconds <= 0) return null
  
  // MET values for different cardio types (approximate)
  const metValues: Record<string, number> = {
    treadmill: 8.0, // running at 8 km/h
    bike: 6.0, // moderate cycling
    rower: 7.0,
    elliptical: 5.0,
    stair_climber: 8.0,
    ski_erg: 7.5,
    treadmill_incline_walk: 5.5,
    outdoor_run: 8.0,
  }
  
  const baseMET = metValues[cardioType] || 6.0
  
  // Adjust MET based on distance/pace if available
  let adjustedMET = baseMET
  if (distanceMeters && distanceMeters > 0) {
    const durationHours = durationSeconds / 3600
    const speedKmh = (distanceMeters / 1000) / durationHours
    
    // Adjust MET based on speed (faster = higher MET)
    if (cardioType === 'treadmill' || cardioType === 'outdoor_run') {
      adjustedMET = Math.max(6.0, Math.min(12.0, speedKmh * 0.8))
    } else if (cardioType === 'bike') {
      adjustedMET = Math.max(4.0, Math.min(10.0, speedKmh * 0.5))
    }
  }
  
  // Adjust based on heart rate if available (higher HR = higher MET)
  if (avgHr && avgHr > 0) {
    // Rough estimate: HR 50-60% max = 0.7x, 60-70% = 1.0x, 70-80% = 1.3x, 80-90% = 1.6x, 90%+ = 2.0x
    // Assuming max HR = 220 - age (we'll use 180 as default if age unknown)
    const estimatedMaxHr = 180
    const hrPercent = (avgHr / estimatedMaxHr) * 100
    let hrMultiplier = 1.0
    if (hrPercent >= 90) hrMultiplier = 2.0
    else if (hrPercent >= 80) hrMultiplier = 1.6
    else if (hrPercent >= 70) hrMultiplier = 1.3
    else if (hrPercent >= 60) hrMultiplier = 1.0
    else hrMultiplier = 0.7
    
    adjustedMET *= hrMultiplier
  }
  
  const durationHours = durationSeconds / 3600
  const calories = adjustedMET * weightKg * durationHours
  
  return Math.round(calories)
}

/**
 * Check if a session is a PR (Personal Record) for a given distance
 * Compares against previous sessions of similar distance (±5% tolerance)
 */
export function isPR(
  distanceMeters: number,
  durationSeconds: number,
  previousSessions: Array<{ distance: number | null; total_duration: number }>
): boolean {
  if (distanceMeters <= 0 || durationSeconds <= 0) return false
  
  // Find sessions within 5% distance tolerance
  const tolerance = 0.05
  const similarSessions = previousSessions.filter(session => {
    if (!session.distance || session.distance <= 0) return false
    const distanceDiff = Math.abs(session.distance - distanceMeters) / distanceMeters
    return distanceDiff <= tolerance
  })
  
  if (similarSessions.length === 0) return true // No previous sessions, so it's a PR
  
  // Check if this is faster than all previous sessions
  const fastestTime = Math.min(...similarSessions.map(s => s.total_duration))
  return durationSeconds < fastestTime
}

/**
 * Calculate average pace from multiple intervals
 */
export function calculateAveragePace(intervals: Array<{ distance: number | null; duration: number }>): number | null {
  const validIntervals = intervals.filter(i => i.distance && i.distance > 0 && i.duration > 0)
  if (validIntervals.length === 0) return null
  
  const totalDistance = validIntervals.reduce((sum, i) => sum + (i.distance || 0), 0)
  const totalDuration = validIntervals.reduce((sum, i) => sum + i.duration, 0)
  
  if (totalDistance <= 0 || totalDuration <= 0) return null
  
  return (totalDuration / totalDistance) * 1000 // seconds per km
}

/**
 * Calculate total distance from intervals
 */
export function calculateTotalDistance(intervals: Array<{ distance: number | null }>): number {
  return intervals.reduce((sum, i) => sum + (i.distance || 0), 0)
}

