import { format } from 'date-fns'

export const getDemoSupplements = () => [
  {
    id: 'demo-supp-1',
    user_id: 'demo-user',
    name: 'Creatine Monohydrate',
    type: 'Powder' as const,
    default_amount: 5,
    unit: 'g',
    daily_goal: 5,
    icon: '💪',
    color: '#3b82f6',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-supp-2',
    user_id: 'demo-user',
    name: 'Whey Protein',
    type: 'Powder' as const,
    default_amount: 30,
    unit: 'g',
    daily_goal: 60,
    icon: '🥛',
    color: '#8b5cf6',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-supp-3',
    user_id: 'demo-user',
    name: 'Vitamin D3',
    type: 'Capsule' as const,
    default_amount: 1,
    unit: 'capsule',
    daily_goal: 1,
    icon: '☀️',
    color: '#f59e0b',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-supp-4',
    user_id: 'demo-user',
    name: 'Omega-3 Fish Oil',
    type: 'Capsule' as const,
    default_amount: 2,
    unit: 'capsules',
    daily_goal: 2,
    icon: '🐟',
    color: '#06b6d4',
    created_at: new Date().toISOString(),
  },
]

export const getDemoSupplementLogs = () => {
  const today = format(new Date(), 'yyyy-MM-dd')
  return [
    // Creatine - fully completed
    {
      id: 'demo-log-1',
      supplement_id: 'demo-supp-1',
      user_id: 'demo-user',
      amount: 5,
      date: today,
      time: '08:30',
      created_at: new Date().toISOString(),
    },
    // Whey Protein - partial (30/60)
    {
      id: 'demo-log-2',
      supplement_id: 'demo-supp-2',
      user_id: 'demo-user',
      amount: 30,
      date: today,
      time: '09:00',
      created_at: new Date().toISOString(),
    },
    // Vitamin D3 - completed
    {
      id: 'demo-log-3',
      supplement_id: 'demo-supp-3',
      user_id: 'demo-user',
      amount: 1,
      date: today,
      time: '08:00',
      created_at: new Date().toISOString(),
    },
    // Omega-3 - completed
    {
      id: 'demo-log-4',
      supplement_id: 'demo-supp-4',
      user_id: 'demo-user',
      amount: 2,
      date: today,
      time: '20:00',
      created_at: new Date().toISOString(),
    },
  ]
}

export const getDemoSupplementStats = () => ({
  total_supplements: 4,
  completed_today: 3,
  completion_rate: 75,
  current_streak: 7,
  total_logs_this_week: 28,
  most_consistent: 'Creatine Monohydrate',
})

