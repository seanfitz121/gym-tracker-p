// Cardio types for sessions and intervals

export type CardioType = 
  | 'treadmill'
  | 'bike'
  | 'rower'
  | 'elliptical'
  | 'stair_climber'
  | 'ski_erg'
  | 'treadmill_incline_walk'
  | 'outdoor_run'

export type CardioMode = 'manual' | 'timer' | 'interval'

export type DistanceUnit = 'km' | 'miles'

// Database row types
export interface CardioSession {
  id: string
  user_id: string
  cardio_type: CardioType
  mode: CardioMode
  total_duration: number // seconds
  total_distance: number | null // meters
  avg_pace: number | null // seconds per km
  calories: number | null
  avg_hr: number | null
  max_hr: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CardioInterval {
  id: string
  session_id: string
  label: string | null
  duration: number // seconds
  distance: number | null // meters
  avg_pace: number | null // seconds per km
  incline: number | null // percent
  resistance: number | null // 0-100 scale
  avg_hr: number | null
  max_hr: number | null
  rpe: number | null // 1-10
  order_index: number
  created_at: string
}

// Extended types with relations
export interface CardioSessionWithIntervals extends CardioSession {
  intervals: CardioInterval[]
}

// Form/UI types
export interface CardioSessionFormData {
  cardio_type: CardioType
  mode: CardioMode
  total_duration: number
  total_distance: number | null
  distance_unit: DistanceUnit
  avg_pace: number | null
  pace_unit: 'min/km' | 'min/mile'
  calories: number | null
  avg_hr: number | null
  max_hr: number | null
  notes: string | null
  intervals: CardioIntervalFormData[]
}

export interface CardioIntervalFormData {
  label: string | null
  duration: number // seconds
  distance: number | null
  distance_unit: DistanceUnit
  avg_pace: number | null
  pace_unit: 'min/km' | 'min/mile'
  incline: number | null
  resistance: number | null
  avg_hr: number | null
  max_hr: number | null
  rpe: number | null
  order_index: number
}

// Interval builder types
export interface IntervalTemplate {
  label: string
  duration: number // seconds
  distance?: number | null
  pace?: number | null
  incline?: number | null
  resistance?: number | null
  rounds?: number // for repeating intervals
}

export interface IntervalPlan {
  name: string
  intervals: IntervalTemplate[]
  totalDuration: number
}

// Stats types
export interface CardioStats {
  total_sessions: number
  total_duration: number // seconds
  total_distance: number // meters
  avg_pace: number | null // seconds per km
  total_calories: number | null
  best_pace: number | null // seconds per km (fastest)
  best_distance: number | null // meters (longest)
  sessions_by_type: Record<CardioType, number>
  weekly_total: number // sessions this week
  monthly_total: number // sessions this month
}

export interface CardioPR {
  distance: number // meters
  time: number // seconds
  pace: number // seconds per km
  date: string
  session_id: string
}

// Machine type metadata
export interface CardioMachineInfo {
  type: CardioType
  name: string
  icon: string
  supportsIncline: boolean
  supportsResistance: boolean
  supportsCadence: boolean
  defaultUnit: DistanceUnit
}

