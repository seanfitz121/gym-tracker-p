export interface WeightLog {
  id: string
  user_id: string
  weight: number
  unit: 'kg' | 'lb'
  logged_at: string // ISO date string (YYYY-MM-DD)
  created_at: string
  updated_at: string
}

export interface CreateWeightLogInput {
  weight: number
  unit: 'kg' | 'lb'
  logged_at: string // ISO date string (YYYY-MM-DD)
}

export interface UpdateWeightLogInput {
  weight?: number
  unit?: 'kg' | 'lb'
  logged_at?: string
}

export interface WeightInsights {
  weeklyAverage: number | null
  weightChange7Days: number | null
  weightChange30Days: number | null
  weightChange90Days: number | null
  trackingStreak: number
  totalEntries: number
  latestWeight: number | null
  latestDate: string | null
  unit: 'kg' | 'lb'
}

export interface WeightChartData {
  date: string
  weight: number
  displayDate: string // Formatted for display (e.g., "Jan 15")
}


