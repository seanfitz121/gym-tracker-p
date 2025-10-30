// Supplement Tracker Types

export type SupplementType = 'pills' | 'tablets' | 'powder' | 'capsule' | 'liquid' | 'other';

export interface SupplementDefinition {
  id: string;
  user_id: string;
  name: string;
  type: SupplementType;
  unit: string; // e.g., 'g', 'mg', 'scoops', 'capsules'
  daily_goal: number;
  color?: string; // hex color
  icon?: string; // emoji or icon name
  reminder_enabled: boolean;
  reminder_time?: string; // HH:MM format
  is_quantitative: boolean; // true for measured amounts, false for yes/no tracking
  created_at: string;
  updated_at: string;
}

export interface SupplementLog {
  id: string;
  user_id: string;
  supplement_id: string;
  amount: number;
  taken_at: string;
  date: string; // YYYY-MM-DD
  notes?: string;
  created_at: string;
}

export interface SupplementProgress {
  supplement_id: string;
  name: string;
  unit: string;
  daily_goal: number;
  is_quantitative: boolean;
  date: string;
  total_taken: number;
  progress_percentage: number;
  log_count: number;
}

export interface CreateSupplementDefinitionInput {
  name: string;
  type: SupplementType;
  unit: string;
  daily_goal: number;
  color?: string;
  icon?: string;
  reminder_enabled?: boolean;
  reminder_time?: string;
  is_quantitative?: boolean;
}

export interface UpdateSupplementDefinitionInput {
  name?: string;
  type?: SupplementType;
  unit?: string;
  daily_goal?: number;
  color?: string;
  icon?: string;
  reminder_enabled?: boolean;
  reminder_time?: string;
  is_quantitative?: boolean;
}

export interface CreateSupplementLogInput {
  supplement_id: string;
  amount: number;
  unit?: string; // e.g., 'g', 'mg', 'ml'
  taken_at?: string; // defaults to now
  date?: string; // defaults to today
  notes?: string;
}

export interface SupplementStats {
  supplement_id: string;
  name: string;
  type: string;
  daily_goal: number;
  unit: string;
  days_logged: number;
  days_met_goal: number;
  adherence_percentage: number;
  average_daily_intake: number;
  current_streak: number;
  longest_streak: number;
  total_logs: number;
}

