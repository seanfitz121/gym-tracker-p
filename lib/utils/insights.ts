import { differenceInDays, subDays, startOfWeek, endOfWeek, subWeeks, isWithinInterval } from 'date-fns'

export interface WorkoutInsight {
  type: 'positive' | 'warning' | 'neutral' | 'achievement'
  message: string
  emoji: string
}

interface WorkoutData {
  exerciseId: string
  exerciseName: string
  bodyPart: string | null
  date: Date
  volume: number
  estimatedOneRM: number
}

/**
 * Generate coaching insights from workout data
 */
export function generateInsights(workouts: WorkoutData[]): WorkoutInsight[] {
  if (workouts.length === 0) return []

  const insights: WorkoutInsight[] = []
  const now = new Date()
  
  // Sort by date
  const sortedWorkouts = [...workouts].sort((a, b) => b.date.getTime() - a.date.getTime())

  // 1. Volume trends (compare last 30 days vs previous 30 days)
  const volumeInsight = calculateVolumeTrend(sortedWorkouts, now)
  if (volumeInsight) insights.push(volumeInsight)

  // 2. Missed muscle groups (hasn't been trained in 7+ days)
  const missedMuscleInsight = checkMissedMuscleGroups(sortedWorkouts, now)
  if (missedMuscleInsight) insights.push(missedMuscleInsight)

  // 3. PR streak detection
  const prStreakInsight = detectPRStreak(sortedWorkouts)
  if (prStreakInsight) insights.push(prStreakInsight)

  // 4. Training frequency
  const frequencyInsight = analyzeTrainingFrequency(sortedWorkouts, now)
  if (frequencyInsight) insights.push(frequencyInsight)

  // 5. Exercise-specific improvements
  const improvementInsight = detectImprovements(sortedWorkouts, now)
  if (improvementInsight) insights.push(improvementInsight)

  return insights.slice(0, 4) // Return top 4 insights
}

function calculateVolumeTrend(workouts: WorkoutData[], now: Date): WorkoutInsight | null {
  const thirtyDaysAgo = subDays(now, 30)
  const sixtyDaysAgo = subDays(now, 60)

  const recentVolume = workouts
    .filter(w => w.date >= thirtyDaysAgo)
    .reduce((sum, w) => sum + w.volume, 0)

  const previousVolume = workouts
    .filter(w => w.date >= sixtyDaysAgo && w.date < thirtyDaysAgo)
    .reduce((sum, w) => sum + w.volume, 0)

  if (previousVolume === 0) return null

  const percentChange = ((recentVolume - previousVolume) / previousVolume) * 100

  if (Math.abs(percentChange) < 5) return null // Not significant enough

  if (percentChange > 0) {
    return {
      type: 'positive',
      message: `Total volume up ${Math.round(percentChange)}% vs last month — keep it up!`,
      emoji: '📈'
    }
  } else {
    return {
      type: 'warning',
      message: `Total volume down ${Math.abs(Math.round(percentChange))}% vs last month — time to push harder?`,
      emoji: '📉'
    }
  }
}

function checkMissedMuscleGroups(workouts: WorkoutData[], now: Date): WorkoutInsight | null {
  const sevenDaysAgo = subDays(now, 7)
  
  // Get all unique body parts trained in the last 60 days
  const sixtyDaysAgo = subDays(now, 60)
  const allBodyParts = new Set(
    workouts
      .filter(w => w.date >= sixtyDaysAgo && w.bodyPart)
      .map(w => w.bodyPart!)
  )

  // Check which body parts haven't been trained recently
  const recentBodyParts = new Set(
    workouts
      .filter(w => w.date >= sevenDaysAgo && w.bodyPart)
      .map(w => w.bodyPart!)
  )

  const missedBodyParts = Array.from(allBodyParts).filter(bp => !recentBodyParts.has(bp))

  if (missedBodyParts.length === 0) return null

  // Find the one that hasn't been trained the longest
  const bodyPartDays: { [key: string]: number } = {}
  for (const bp of missedBodyParts) {
    const lastWorkout = workouts
      .filter(w => w.bodyPart === bp)
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0]
    
    if (lastWorkout) {
      bodyPartDays[bp] = differenceInDays(now, lastWorkout.date)
    }
  }

  const mostMissed = Object.entries(bodyPartDays)
    .sort(([, daysA], [, daysB]) => daysB - daysA)[0]

  if (!mostMissed || mostMissed[1] < 7) return null

  return {
    type: 'warning',
    message: `You haven't trained ${mostMissed[0]} in ${mostMissed[1]} days.`,
    emoji: '⚠️'
  }
}

function detectPRStreak(workouts: WorkoutData[]): WorkoutInsight | null {
  // Group by exercise and check if 1RM increased week over week
  const exerciseGroups: { [key: string]: WorkoutData[] } = {}
  
  workouts.forEach(w => {
    if (!exerciseGroups[w.exerciseId]) {
      exerciseGroups[w.exerciseId] = []
    }
    exerciseGroups[w.exerciseId].push(w)
  })

  let longestStreak = 0
  let streakExercise = ''

  for (const [exerciseId, data] of Object.entries(exerciseGroups)) {
    const sortedByDate = data.sort((a, b) => a.date.getTime() - b.date.getTime())
    
    // Group by week
    const weeklyMax: { [key: string]: { max1RM: number; name: string } } = {}
    sortedByDate.forEach(w => {
      const weekStart = startOfWeek(w.date).toISOString()
      if (!weeklyMax[weekStart] || w.estimatedOneRM > weeklyMax[weekStart].max1RM) {
        weeklyMax[weekStart] = { max1RM: w.estimatedOneRM, name: w.exerciseName }
      }
    })

    // Check for consecutive weeks of improvement
    const weeks = Object.entries(weeklyMax).sort(([a], [b]) => 
      new Date(a).getTime() - new Date(b).getTime()
    )

    let currentStreak = 0
    for (let i = 1; i < weeks.length; i++) {
      if (weeks[i][1].max1RM > weeks[i - 1][1].max1RM) {
        currentStreak++
      } else {
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak
          streakExercise = weeks[i - 1][1].name
        }
        currentStreak = 0
      }
    }
    
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak
      streakExercise = sortedByDate[sortedByDate.length - 1].exerciseName
    }
  }

  if (longestStreak >= 2) {
    return {
      type: 'achievement',
      message: `${streakExercise} PR streak: ${longestStreak + 1} weeks in a row!`,
      emoji: '🔥'
    }
  }

  return null
}

function analyzeTrainingFrequency(workouts: WorkoutData[], now: Date): WorkoutInsight | null {
  const fourWeeksAgo = subWeeks(now, 4)
  const recentWorkouts = workouts.filter(w => w.date >= fourWeeksAgo)
  
  // Count unique workout days
  const uniqueDays = new Set(
    recentWorkouts.map(w => w.date.toDateString())
  ).size

  const weeksPerDay = uniqueDays / 4

  if (weeksPerDay >= 4) {
    return {
      type: 'positive',
      message: `Crushing it with ${uniqueDays} workouts in 4 weeks — excellent consistency!`,
      emoji: '💪'
    }
  } else if (weeksPerDay >= 3) {
    return {
      type: 'positive',
      message: `${uniqueDays} workouts in 4 weeks — solid routine!`,
      emoji: '✅'
    }
  } else if (weeksPerDay < 2) {
    return {
      type: 'warning',
      message: `Only ${uniqueDays} workouts in 4 weeks — let's get back on track!`,
      emoji: '🎯'
    }
  }

  return null
}

function detectImprovements(workouts: WorkoutData[], now: Date): WorkoutInsight | null {
  const twoWeeksAgo = subWeeks(now, 2)
  const fourWeeksAgo = subWeeks(now, 4)

  // Group by exercise
  const exerciseGroups: { [key: string]: WorkoutData[] } = {}
  workouts.forEach(w => {
    if (!exerciseGroups[w.exerciseId]) {
      exerciseGroups[w.exerciseId] = []
    }
    exerciseGroups[w.exerciseId].push(w)
  })

  // Find exercise with biggest 1RM improvement in last 2 weeks vs previous 2 weeks
  let biggestImprovement = 0
  let improvedExercise = ''

  for (const [exerciseId, data] of Object.entries(exerciseGroups)) {
    const recent = data.filter(w => w.date >= twoWeeksAgo)
    const previous = data.filter(w => w.date >= fourWeeksAgo && w.date < twoWeeksAgo)

    if (recent.length === 0 || previous.length === 0) continue

    const recentMax = Math.max(...recent.map(w => w.estimatedOneRM))
    const previousMax = Math.max(...previous.map(w => w.estimatedOneRM))

    const improvement = ((recentMax - previousMax) / previousMax) * 100

    if (improvement > biggestImprovement && improvement >= 5) {
      biggestImprovement = improvement
      improvedExercise = recent[0].exerciseName
    }
  }

  if (biggestImprovement >= 5) {
    return {
      type: 'achievement',
      message: `${improvedExercise} strength up ${Math.round(biggestImprovement)}% in 2 weeks!`,
      emoji: '💪'
    }
  }

  return null
}


