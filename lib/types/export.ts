// Types for workout exports

export interface ExportWorkout {
  id: string;
  title?: string;
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
  total_sets: number;
  total_volume_kg: number;
  exercises: ExportExercise[];
}

export interface ExportExercise {
  name: string;
  sets: ExportSet[];
}

export interface ExportSet {
  set_number: number;
  reps: number;
  weight: number;
  weight_unit: 'kg' | 'lb';
  rpe?: number;
  is_warmup: boolean;
}

export interface ExportTemplate {
  id: string;
  name: string;
  exercises: {
    name: string;
    sets: number;
    target_reps?: string;
    target_weight?: string;
    notes?: string;
  }[];
}

export interface ExportWeeklySummary {
  week_start: string;
  week_end: string;
  total_workouts: number;
  total_sets: number;
  total_volume_kg: number;
  total_duration_minutes: number;
  xp_earned: number;
  workouts: ExportWorkout[];
}

export type ExportFormat = 'csv' | 'pdf';

