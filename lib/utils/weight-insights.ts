import { WeightLog, WeightInsights, WeightChartData } from '@/lib/types/weight'
import { format, parseISO, subDays, differenceInDays } from 'date-fns'

/**
 * Calculate comprehensive weight insights from weight logs
 */
export function calculateWeightInsights(
  logs: WeightLog[],
  preferredUnit: 'kg' | 'lb' = 'kg'
): WeightInsights {
  if (logs.length === 0) {
    return {
      weeklyAverage: null,
      weightChange7Days: null,
      weightChange30Days: null,
      weightChange90Days: null,
      trackingStreak: 0,
      totalEntries: 0,
      latestWeight: null,
      latestDate: null,
      unit: preferredUnit,
    }
  }

  // Sort logs by date (most recent first)
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
  )

  const latestLog = sortedLogs[0]
  const today = new Date()

  // Calculate weekly average (last 7 days)
  const sevenDaysAgo = subDays(today, 7)
  const recentLogs = sortedLogs.filter(log => 
    new Date(log.logged_at) >= sevenDaysAgo
  )
  const weeklyAverage = recentLogs.length > 0
    ? recentLogs.reduce((sum, log) => sum + convertWeight(log.weight, log.unit, preferredUnit), 0) / recentLogs.length
    : null

  // Calculate weight changes
  const weightChange7Days = calculateWeightChange(sortedLogs, 7, preferredUnit)
  const weightChange30Days = calculateWeightChange(sortedLogs, 30, preferredUnit)
  const weightChange90Days = calculateWeightChange(sortedLogs, 90, preferredUnit)

  // Calculate tracking streak (consecutive days with entries)
  const trackingStreak = calculateTrackingStreak(sortedLogs)

  return {
    weeklyAverage: weeklyAverage ? parseFloat(weeklyAverage.toFixed(1)) : null,
    weightChange7Days: weightChange7Days ? parseFloat(weightChange7Days.toFixed(1)) : null,
    weightChange30Days: weightChange30Days ? parseFloat(weightChange30Days.toFixed(1)) : null,
    weightChange90Days: weightChange90Days ? parseFloat(weightChange90Days.toFixed(1)) : null,
    trackingStreak,
    totalEntries: logs.length,
    latestWeight: convertWeight(latestLog.weight, latestLog.unit, preferredUnit),
    latestDate: latestLog.logged_at,
    unit: preferredUnit,
  }
}

/**
 * Calculate weight change over a period
 */
function calculateWeightChange(
  sortedLogs: WeightLog[],
  days: number,
  targetUnit: 'kg' | 'lb'
): number | null {
  if (sortedLogs.length === 0) return null

  const today = new Date()
  const startDate = subDays(today, days)
  
  const latestLog = sortedLogs[0]
  const oldestRelevantLog = sortedLogs
    .filter(log => new Date(log.logged_at) >= startDate)
    .sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime())[0]

  if (!oldestRelevantLog) return null

  const latestWeight = convertWeight(latestLog.weight, latestLog.unit, targetUnit)
  const oldestWeight = convertWeight(oldestRelevantLog.weight, oldestRelevantLog.unit, targetUnit)

  return latestWeight - oldestWeight
}

/**
 * Calculate consecutive tracking streak
 */
function calculateTrackingStreak(sortedLogs: WeightLog[]): number {
  if (sortedLogs.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  let currentDate = today

  for (const log of sortedLogs) {
    const logDate = parseISO(log.logged_at)
    logDate.setHours(0, 0, 0, 0)

    const daysDiff = differenceInDays(currentDate, logDate)

    // If this log is for the current date we're checking, continue streak
    if (daysDiff === 0) {
      streak++
      currentDate = subDays(currentDate, 1)
    }
    // If there's a 1-day gap, we might still continue (allowing for daily tracking)
    else if (daysDiff === 1) {
      // Move to the day of the log and continue
      currentDate = logDate
      streak++
      currentDate = subDays(currentDate, 1)
    }
    // If there's a bigger gap, streak is broken
    else {
      break
    }
  }

  return streak
}

/**
 * Convert weight between units
 */
export function convertWeight(
  weight: number,
  fromUnit: 'kg' | 'lb',
  toUnit: 'kg' | 'lb'
): number {
  if (fromUnit === toUnit) return weight

  if (fromUnit === 'kg' && toUnit === 'lb') {
    return weight * 2.20462
  } else {
    return weight / 2.20462
  }
}

/**
 * Prepare data for chart visualization
 */
export function prepareChartData(
  logs: WeightLog[],
  targetUnit: 'kg' | 'lb' = 'kg',
  smooth: boolean = false
): WeightChartData[] {
  if (logs.length === 0) return []

  // Sort by date (oldest first for chart)
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
  )

  let chartData: WeightChartData[] = sortedLogs.map(log => ({
    date: log.logged_at,
    weight: parseFloat(convertWeight(log.weight, log.unit, targetUnit).toFixed(1)),
    displayDate: format(parseISO(log.logged_at), 'MMM d'),
  }))

  // Apply smoothing if requested (simple moving average)
  if (smooth && chartData.length > 2) {
    chartData = applyMovingAverage(chartData, 3)
  }

  return chartData
}

/**
 * Apply simple moving average for chart smoothing
 */
function applyMovingAverage(data: WeightChartData[], window: number): WeightChartData[] {
  if (data.length < window) return data

  return data.map((point, index) => {
    if (index < window - 1) return point

    const windowData = data.slice(index - window + 1, index + 1)
    const average = windowData.reduce((sum, d) => sum + d.weight, 0) / window

    return {
      ...point,
      weight: parseFloat(average.toFixed(1)),
    }
  })
}

/**
 * Generate insight message based on weight change
 */
export function generateInsightMessage(insights: WeightInsights): string | null {
  const { weightChange30Days, unit, latestWeight } = insights

  if (weightChange30Days === null || latestWeight === null) {
    return null
  }

  const absChange = Math.abs(weightChange30Days)
  const direction = weightChange30Days > 0 ? 'up' : 'down'
  const emoji = weightChange30Days > 0 ? '📈' : '📉'

  if (absChange < 0.5) {
    return `${emoji} Your weight has been stable over the last 30 days`
  } else if (absChange < 2) {
    return `${emoji} You're ${direction} ${absChange.toFixed(1)}${unit} in the last 30 days`
  } else {
    return `${emoji} You're ${direction} ${absChange.toFixed(1)}${unit} in the last 30 days – great progress!`
  }
}


