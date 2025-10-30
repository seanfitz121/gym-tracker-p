import { format, subDays } from 'date-fns'

export const getDemoWeightLogs = () => {
  const today = new Date()
  const logs = []
  
  // Starting weight: 85kg, gradually decreasing over 30 days
  const startWeight = 85
  const targetWeight = 80
  const days = 30

  for (let i = 0; i < days; i++) {
    const logDate = subDays(today, days - i - 1)
    const date = format(logDate, 'yyyy-MM-dd')
    // Gradual weight loss with some natural fluctuation
    const progress = i / days
    const baseWeight = startWeight - (startWeight - targetWeight) * progress
    const fluctuation = (Math.random() - 0.5) * 0.8 // ±0.4kg daily fluctuation
    const weight = Math.round((baseWeight + fluctuation) * 10) / 10 // Round to 1 decimal

    // Set time to morning (7-8 AM)
    const logTime = new Date(logDate)
    logTime.setHours(7, Math.floor(Math.random() * 60), 0, 0)

    logs.push({
      id: `demo-${i}`,
      user_id: 'demo-user',
      weight,
      weight_unit: 'kg',
      unit: 'kg' as const,
      date,
      logged_at: logTime.toISOString(),
      notes: i === 0 ? 'Starting my journey!' : i === days - 1 ? 'Great progress!' : undefined,
      created_at: logTime.toISOString(),
      updated_at: logTime.toISOString(),
    })
  }

  return logs.reverse() // Most recent first
}

export const getDemoWeightGoal = () => ({
  id: 'demo-goal',
  user_id: 'demo-user',
  target_weight: 80,
  unit: 'kg' as const,
  target_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
  goal_type: 'lose' as const,
  start_weight: 85,
  start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

export const getDemoBodyMetrics = () => ({
  id: 'demo-metrics',
  user_id: 'demo-user',
  height_cm: 178,
  waist_cm: 85,
  neck_cm: 38,
  hip_cm: 95,
  bodyfat_est: 18,
  gender: 'male' as const,
  logged_at: new Date().toISOString().split('T')[0],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
})

