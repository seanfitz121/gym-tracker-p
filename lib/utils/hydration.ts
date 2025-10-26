import { HydrationLog, WeeklyHydrationData } from '@/lib/types/hydration'
import { format, parseISO, subDays, startOfDay } from 'date-fns'

/**
 * Calculate daily total from logs for a specific date
 */
export function calculateDailyTotal(logs: HydrationLog[], date: Date): number {
  const targetDate = format(date, 'yyyy-MM-dd')
  
  return logs
    .filter(log => format(parseISO(log.logged_at), 'yyyy-MM-dd') === targetDate)
    .reduce((total, log) => total + log.amount_ml, 0)
}

/**
 * Prepare data for weekly bar chart (last 7 days)
 */
export function prepareWeeklyChartData(
  logs: HydrationLog[],
  goalMl: number
): WeeklyHydrationData[] {
  const today = new Date()
  const chartData: WeeklyHydrationData[] = []

  // Generate last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = subDays(today, i)
    const dateStr = format(date, 'yyyy-MM-dd')
    
    // Calculate total for this day
    const dayTotal = logs
      .filter(log => format(parseISO(log.logged_at), 'yyyy-MM-dd') === dateStr)
      .reduce((total, log) => total + log.amount_ml, 0)

    chartData.push({
      date: dateStr,
      total_ml: dayTotal,
      goal_ml: goalMl,
      percentage: (dayTotal / goalMl) * 100,
      displayDate: format(date, 'EEE'), // Mon, Tue, Wed, etc.
    })
  }

  return chartData
}

/**
 * Format water amount for display
 */
export function formatWaterAmount(ml: number, showMl: boolean = false): string {
  if (ml >= 1000) {
    const liters = ml / 1000
    return showMl ? `${liters.toFixed(2)}L (${ml}ml)` : `${liters.toFixed(2)}L`
  }
  return `${ml}ml`
}

/**
 * Get today's logs
 */
export function getTodaysLogs(logs: HydrationLog[]): HydrationLog[] {
  const today = format(new Date(), 'yyyy-MM-dd')
  
  return logs.filter(log => 
    format(parseISO(log.logged_at), 'yyyy-MM-dd') === today
  ).sort((a, b) => 
    new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
  )
}

/**
 * Calculate percentage toward goal
 */
export function calculateGoalPercentage(current: number, goal: number): number {
  return Math.min(100, (current / goal) * 100)
}

/**
 * Get color based on progress percentage
 */
export function getProgressColor(percentage: number): string {
  if (percentage >= 100) return '#10b981' // green
  if (percentage >= 75) return '#3b82f6' // blue
  if (percentage >= 50) return '#f59e0b' // orange
  return '#6b7280' // gray
}

