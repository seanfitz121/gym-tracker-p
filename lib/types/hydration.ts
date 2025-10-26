export interface HydrationLog {
  id: string
  user_id: string
  amount_ml: number
  logged_at: string // ISO timestamp
  created_at: string
}

export interface CreateHydrationLogInput {
  amount_ml: number
  logged_at?: string // Optional, defaults to now
}

export interface DailyHydrationSummary {
  date: string // ISO date (YYYY-MM-DD)
  total_ml: number
  goal_ml: number
  percentage: number
  goal_met: boolean
  entries: HydrationLog[]
}

export interface WeeklyHydrationData {
  date: string // ISO date
  total_ml: number
  goal_ml: number
  percentage: number
  displayDate: string // e.g., "Mon"
}

export interface HydrationStats {
  today_total: number
  today_percentage: number
  goal_met_today: boolean
  current_streak: number
  weekly_average: number
  best_day_this_week: number
  goal_ml: number
}


