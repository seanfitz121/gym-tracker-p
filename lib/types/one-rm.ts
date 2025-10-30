export interface OneRMLift {
  id: string
  user_id: string
  exercise_id: string
  weight: number
  weight_unit: 'kg' | 'lb'
  set_entry_id?: string | null
  logged_at: string
  notes?: string | null
  created_at: string
}

export interface OneRMGoal {
  id: string
  user_id: string
  exercise_id: string
  target_weight: number
  weight_unit: 'kg' | 'lb'
  target_date?: string | null
  achieved: boolean
  achieved_at?: string | null
  created_at: string
  updated_at: string
}

export interface OneRMProgress {
  id: string
  user_id: string
  exercise_id: string
  exercise_name: string
  body_part?: string | null
  weight: number
  weight_unit: 'kg' | 'lb'
  logged_at: string
  notes?: string | null
  goal_weight?: number | null
  goal_unit?: 'kg' | 'lb' | null
  goal_date?: string | null
  goal_achieved?: boolean | null
  goal_progress_percent?: number | null
}

export interface CreateOneRMLiftInput {
  exercise_id: string
  weight: number
  weight_unit: 'kg' | 'lb'
  logged_at?: string
  notes?: string
}

export interface CreateOneRMGoalInput {
  exercise_id: string
  target_weight: number
  weight_unit: 'kg' | 'lb'
  target_date?: string
}

export interface UpdateOneRMGoalInput {
  target_weight?: number
  weight_unit?: 'kg' | 'lb'
  target_date?: string
  achieved?: boolean
}

