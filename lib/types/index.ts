import type { Database } from '../supabase/types'

// Database types
export type Profile = Database['public']['Tables']['profile']['Row'] & {
  avatar_url?: string | null
  updated_at?: string | null
}
export type Exercise = Database['public']['Tables']['exercise']['Row']
export type WorkoutSession = Database['public']['Tables']['workout_session']['Row']
export type SetEntry = Database['public']['Tables']['set_entry']['Row']
export type PersonalRecord = Database['public']['Tables']['personal_record']['Row']
export type Template = Database['public']['Tables']['template']['Row']
export type UserGamification = Database['public']['Tables']['user_gamification']['Row'] & {
  rank_code?: string | null
  pro_rank_code?: string | null
  rank_scale_code?: string | null
}
export type RankScale = Database['public']['Tables']['rank_scale']['Row']
export type RankDefinition = Database['public']['Tables']['rank_definition']['Row']
export type AdminUser = Database['public']['Tables']['admin_user']['Row']
export type WeightUnit = 'kg' | 'lb'

// Extended rank types
export interface UserRank {
  code: string
  name: string
  color?: string | null
  icon?: string | null
  scale: string
  isAdmin?: boolean
}

export interface RankProgress {
  currentRank: UserRank
  nextRank: RankDefinition | null
  progress: number // 0-1
  xpToNext: number
  totalXp: number
}

// Extended types with relations
export interface SetEntryWithExercise extends SetEntry {
  exercise: Exercise
}

export interface WorkoutSessionWithSets extends WorkoutSession {
  sets: SetEntryWithExercise[]
}

export interface ExerciseWithPR extends Exercise {
  personalRecord?: PersonalRecord
}

// Template payload type
export interface TemplateExercise {
  name: string
  bodyPart?: string
  sets: Array<{
    reps: number
    weight?: number
    rpe?: number
  }>
  notes?: string
}

export interface TemplatePayload {
  exercises: TemplateExercise[]
}

// Gamification types
export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: string
}

export interface WeeklyGoal {
  daysTarget: number
  prTarget: number
  volumeTarget: number
}

export interface Challenge {
  id: string
  name: string
  description: string
  type: 'weekly' | 'monthly'
  requirement: number
  progress: number
  xpReward: number
  startDate: string
  endDate: string
}

// Chart data types
export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface ExerciseProgress {
  exerciseId: string
  exerciseName: string
  oneRMData: ChartDataPoint[]
  topSetData: ChartDataPoint[]
  volumeData: ChartDataPoint[]
}

// Local state types for workout logging
export interface ActiveSet {
  id: string // temporary client-side ID
  exerciseId: string
  setOrder: number
  reps: number
  weight: number
  weightUnit: WeightUnit
  rpe?: number
  isWarmup: boolean
}

export interface ActiveExercise {
  id: string // exercise ID
  name: string
  bodyPart?: string
  sets: ActiveSet[]
}

export interface ActiveWorkout {
  id?: string // session ID if editing existing
  startedAt: Date
  title?: string
  notes?: string
  exercises: ActiveExercise[]
}

// Settings
export interface AppSettings {
  defaultWeightUnit: WeightUnit
  defaultRestTimer: number // seconds
  chartSmoothing: 'off' | 'low' | 'high'
  privacyMode: boolean
}

