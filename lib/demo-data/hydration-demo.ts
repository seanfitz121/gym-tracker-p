import { format, subDays } from 'date-fns'

export const DEMO_HYDRATION_GOAL = 2500 // 2.5L in ml

export const getDemoHydrationLogs = () => {
  const today = new Date()
  const logs = []

  // Generate 7 days of demo logs
  for (let i = 0; i < 7; i++) {
    const logDate = subDays(today, i)
    const date = format(logDate, 'yyyy-MM-dd')
    const dailyTotal = Math.floor(1800 + Math.random() * 1200) // 1.8L - 3L range
    
    // Create 3-5 logs per day
    const numLogs = 3 + Math.floor(Math.random() * 3)
    const amountPerLog = Math.floor(dailyTotal / numLogs)
    
    for (let j = 0; j < numLogs; j++) {
      const logTime = new Date(logDate)
      logTime.setHours(8 + j * 3, Math.floor(Math.random() * 60), 0, 0)
      
      logs.push({
        id: `demo-${i}-${j}`,
        user_id: 'demo-user',
        amount_ml: amountPerLog + Math.floor(Math.random() * 100 - 50),
        date,
        logged_at: logTime.toISOString(),
        created_at: logTime.toISOString(),
      })
    }
  }

  return logs
}

export const getDemoHydrationStats = () => {
  const logs = getDemoHydrationLogs()
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayLogs = logs.filter(log => log.date === today)
  const todayTotal = todayLogs.reduce((sum, log) => sum + log.amount_ml, 0)

  return {
    today_total: todayTotal,
    today_percentage: Math.round((todayTotal / DEMO_HYDRATION_GOAL) * 100),
    current_streak: 5,
    weekly_average: 2200,
    best_day_this_week: 2800,
  }
}

