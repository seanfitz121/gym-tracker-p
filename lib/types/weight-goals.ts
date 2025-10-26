export type GoalType = 'lose' | 'maintain' | 'gain'

export interface WeightGoal {
  id: string
  user_id: string
  target_weight: number
  unit: 'kg' | 'lb'
  goal_type: GoalType
  start_weight: number | null
  start_date: string // ISO date
  target_date: string | null // ISO date
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateWeightGoalInput {
  target_weight: number
  unit: 'kg' | 'lb'
  goal_type: GoalType
  start_weight?: number
  target_date?: string
}

export interface UpdateWeightGoalInput {
  target_weight?: number
  unit?: 'kg' | 'lb'
  goal_type?: GoalType
  target_date?: string
  is_active?: boolean
}

export interface GoalProgress {
  currentWeight: number
  targetWeight: number
  startWeight: number
  progressPercentage: number // 0-100
  remainingWeight: number
  isCompleted: boolean
  daysElapsed: number
  avgWeightChangePerWeek: number | null
  projectedDaysToGoal: number | null
  projectedGoalDate: string | null // ISO date
}

export interface BodyMetrics {
  id: string
  user_id: string
  height_cm: number | null
  waist_cm: number | null
  neck_cm: number | null
  hip_cm: number | null
  bodyfat_est: number | null
  gender: 'male' | 'female' | null
  logged_at: string // ISO date
  created_at: string
  updated_at: string
}

export interface CreateBodyMetricsInput {
  height_cm?: number
  waist_cm?: number
  neck_cm?: number
  hip_cm?: number
  gender?: 'male' | 'female'
  logged_at?: string
}

export interface UpdateBodyMetricsInput {
  height_cm?: number
  waist_cm?: number
  neck_cm?: number
  hip_cm?: number
  gender?: 'male' | 'female'
  logged_at?: string
}

export interface BodyComposition {
  bmi: number | null
  bmiCategory: string | null
  bodyFatPercentage: number | null
  leanMass: number | null // in kg
  fatMass: number | null // in kg
  waistToHeightRatio: number | null
  waistToHeightCategory: string | null
}


