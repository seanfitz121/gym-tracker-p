import { BodyMetrics, BodyComposition, WeightGoal, GoalProgress } from '@/lib/types/weight-goals'
import { WeightLog } from '@/lib/types/weight'
import { differenceInDays, addDays, format } from 'date-fns'

/**
 * Calculate BMI (Body Mass Index)
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0
  const heightM = heightCm / 100
  return weightKg / (heightM * heightM)
}

/**
 * Get BMI category
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal weight'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}

/**
 * Calculate body fat percentage using US Navy formula
 * https://www.calculator.net/body-fat-calculator.html
 */
export function calculateBodyFatPercentage(
  gender: 'male' | 'female',
  waistCm: number,
  neckCm: number,
  heightCm: number,
  hipCm?: number
): number | null {
  if (!waistCm || !neckCm || !heightCm) return null

  try {
    if (gender === 'male') {
      // Male formula: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
      const bodyFat = 
        495 / 
        (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 
        450
      return Math.max(0, Math.min(100, bodyFat)) // Clamp between 0-100
    } else {
      // Female formula requires hip measurement
      if (!hipCm) return null
      // 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
      const bodyFat = 
        495 / 
        (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.22100 * Math.log10(heightCm)) - 
        450
      return Math.max(0, Math.min(100, bodyFat)) // Clamp between 0-100
    }
  } catch (error) {
    console.error('Error calculating body fat percentage:', error)
    return null
  }
}

/**
 * Calculate lean mass and fat mass
 */
export function calculateBodyComposition(
  weightKg: number,
  bodyFatPercentage: number
): { leanMass: number; fatMass: number } {
  const fatMass = (bodyFatPercentage / 100) * weightKg
  const leanMass = weightKg - fatMass
  return { leanMass, fatMass }
}

/**
 * Calculate waist-to-height ratio
 */
export function calculateWaistToHeightRatio(waistCm: number, heightCm: number): number {
  if (heightCm <= 0) return 0
  return waistCm / heightCm
}

/**
 * Get waist-to-height ratio category
 */
export function getWaistToHeightCategory(ratio: number): string {
  if (ratio < 0.35) return 'Very Lean'
  if (ratio < 0.43) return 'Healthy'
  if (ratio < 0.53) return 'Overweight'
  if (ratio < 0.58) return 'Very Overweight'
  return 'Obese'
}

/**
 * Generate complete body composition analysis
 */
export function analyzeBodyComposition(
  weightKg: number,
  metrics: BodyMetrics | null
): BodyComposition {
  const result: BodyComposition = {
    bmi: null,
    bmiCategory: null,
    bodyFatPercentage: null,
    leanMass: null,
    fatMass: null,
    waistToHeightRatio: null,
    waistToHeightCategory: null,
  }

  if (!metrics) return result

  // Calculate BMI
  if (metrics.height_cm) {
    result.bmi = parseFloat(calculateBMI(weightKg, metrics.height_cm).toFixed(1))
    result.bmiCategory = getBMICategory(result.bmi)
  }

  // Calculate body fat percentage
  if (metrics.gender && metrics.waist_cm && metrics.neck_cm && metrics.height_cm) {
    const bodyFat = calculateBodyFatPercentage(
      metrics.gender,
      metrics.waist_cm,
      metrics.neck_cm,
      metrics.height_cm,
      metrics.hip_cm || undefined
    )
    
    if (bodyFat !== null) {
      result.bodyFatPercentage = parseFloat(bodyFat.toFixed(1))
      
      // Calculate lean and fat mass
      const composition = calculateBodyComposition(weightKg, bodyFat)
      result.leanMass = parseFloat(composition.leanMass.toFixed(1))
      result.fatMass = parseFloat(composition.fatMass.toFixed(1))
    }
  }

  // Calculate waist-to-height ratio
  if (metrics.waist_cm && metrics.height_cm) {
    result.waistToHeightRatio = parseFloat(
      calculateWaistToHeightRatio(metrics.waist_cm, metrics.height_cm).toFixed(3)
    )
    result.waistToHeightCategory = getWaistToHeightCategory(result.waistToHeightRatio)
  }

  return result
}

/**
 * Calculate goal progress and ETA
 */
export function calculateGoalProgress(
  goal: WeightGoal,
  logs: WeightLog[],
  currentWeight: number
): GoalProgress {
  const startWeight = goal.start_weight || currentWeight
  const targetWeight = goal.target_weight
  const totalChange = Math.abs(targetWeight - startWeight)
  const currentChange = Math.abs(currentWeight - startWeight)
  
  // Calculate progress percentage
  let progressPercentage = totalChange > 0 ? (currentChange / totalChange) * 100 : 0
  progressPercentage = Math.min(100, Math.max(0, progressPercentage))

  // Calculate remaining weight
  const remainingWeight = Math.abs(targetWeight - currentWeight)
  
  // Check if goal is completed
  const isCompleted = goal.goal_type === 'lose' 
    ? currentWeight <= targetWeight
    : goal.goal_type === 'gain'
    ? currentWeight >= targetWeight
    : Math.abs(currentWeight - targetWeight) < 0.5

  // Calculate days elapsed
  const startDate = new Date(goal.start_date)
  const today = new Date()
  const daysElapsed = Math.max(0, differenceInDays(today, startDate))

  // Calculate average weight change per week
  let avgWeightChangePerWeek: number | null = null
  let projectedDaysToGoal: number | null = null
  let projectedGoalDate: string | null = null

  if (daysElapsed >= 7 && logs.length >= 2) {
    // Get weight from ~1 week ago
    const weeksAgo = Math.min(4, Math.floor(daysElapsed / 7))
    const sortedLogs = [...logs].sort((a, b) => 
      new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
    )

    if (sortedLogs.length > 0) {
      const oldestRecentLog = sortedLogs[Math.min(weeksAgo * 7, sortedLogs.length - 1)]
      const weightChange = currentWeight - oldestRecentLog.weight
      avgWeightChangePerWeek = weightChange / weeksAgo

      // Project days to goal
      if (Math.abs(avgWeightChangePerWeek) > 0.01) {
        const direction = goal.goal_type === 'lose' ? -1 : goal.goal_type === 'gain' ? 1 : 0
        const isMovingTowardGoal = (avgWeightChangePerWeek * direction) < 0
        
        if (isMovingTowardGoal) {
          const weeksToGoal = remainingWeight / Math.abs(avgWeightChangePerWeek)
          projectedDaysToGoal = Math.round(weeksToGoal * 7)
          projectedGoalDate = format(addDays(today, projectedDaysToGoal), 'yyyy-MM-dd')
        }
      }
    }
  }

  return {
    currentWeight,
    targetWeight,
    startWeight,
    progressPercentage: parseFloat(progressPercentage.toFixed(1)),
    remainingWeight: parseFloat(remainingWeight.toFixed(1)),
    isCompleted,
    daysElapsed,
    avgWeightChangePerWeek: avgWeightChangePerWeek ? parseFloat(avgWeightChangePerWeek.toFixed(2)) : null,
    projectedDaysToGoal,
    projectedGoalDate,
  }
}

/**
 * Check if progress has stalled (>14 days with no significant change)
 */
export function hasProgressStalled(
  logs: WeightLog[],
  goal: WeightGoal,
  threshold: number = 14
): boolean {
  if (logs.length < 2) return false

  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
  )

  // Check last 14 days
  const today = new Date()
  const thresholdDate = addDays(today, -threshold)
  const recentLogs = sortedLogs.filter(log => 
    new Date(log.logged_at) >= thresholdDate
  )

  if (recentLogs.length < 2) return false

  const latestWeight = recentLogs[0].weight
  const oldestRecentWeight = recentLogs[recentLogs.length - 1].weight
  const weightChange = Math.abs(latestWeight - oldestRecentWeight)

  // Consider stalled if less than 0.2kg change in 14 days
  return weightChange < 0.2
}

/**
 * Detect milestones (e.g., lowest/highest weight, goals met)
 */
export function detectMilestones(
  currentLog: WeightLog,
  previousLogs: WeightLog[],
  goal: WeightGoal | null
): string[] {
  const milestones: string[] = []

  if (previousLogs.length === 0) {
    milestones.push('🎉 First weight entry logged!')
    return milestones
  }

  const currentWeight = currentLog.weight
  const sortedLogs = [...previousLogs].sort((a, b) => a.weight - b.weight)
  const lowestWeight = sortedLogs[0].weight
  const highestWeight = sortedLogs[sortedLogs.length - 1].weight

  // Check for new lowest/highest
  if (goal?.goal_type === 'lose' && currentWeight < lowestWeight) {
    milestones.push('🎉 New lowest weight!')
  } else if (goal?.goal_type === 'gain' && currentWeight > highestWeight) {
    milestones.push('💪 New highest weight!')
  }

  // Check for goal completion
  if (goal && !goal.is_active) {
    return milestones // Goal already completed
  }

  if (goal) {
    const isGoalMet = goal.goal_type === 'lose'
      ? currentWeight <= goal.target_weight
      : goal.goal_type === 'gain'
      ? currentWeight >= goal.target_weight
      : Math.abs(currentWeight - goal.target_weight) < 0.5

    if (isGoalMet) {
      milestones.push('🏆 Goal weight reached!')
    }
  }

  // Check for weight loss/gain milestones (every 5kg/10lb)
  if (previousLogs.length > 0) {
    const lastLog = previousLogs[previousLogs.length - 1]
    const weightChange = Math.abs(currentWeight - lastLog.weight)
    
    // Celebrate every 5kg lost
    if (goal?.goal_type === 'lose' && currentWeight < lastLog.weight) {
      const totalLost = lastLog.weight - currentWeight
      if (Math.floor(totalLost / 5) > Math.floor((totalLost - weightChange) / 5)) {
        milestones.push(`🔥 ${Math.floor(totalLost / 5) * 5}kg total lost!`)
      }
    }
  }

  return milestones
}


