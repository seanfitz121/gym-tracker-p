export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profile: {
        Row: {
          id: string
          display_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          created_at?: string
        }
        Relationships: []
      }
      exercise: {
        Row: {
          id: string
          user_id: string
          name: string
          body_part: string | null
          is_custom: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          body_part?: string | null
          is_custom?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          body_part?: string | null
          is_custom?: boolean
          created_at?: string
        }
        Relationships: []
      }
      workout_session: {
        Row: {
          id: string
          user_id: string
          started_at: string
          ended_at: string | null
          title: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          started_at: string
          ended_at?: string | null
          title?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          started_at?: string
          ended_at?: string | null
          title?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      set_entry: {
        Row: {
          id: string
          session_id: string
          exercise_id: string
          set_order: number
          reps: number
          weight: number
          weight_unit: 'kg' | 'lb'
          rpe: number | null
          is_warmup: boolean
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          exercise_id: string
          set_order: number
          reps: number
          weight: number
          weight_unit?: 'kg' | 'lb'
          rpe?: number | null
          is_warmup?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          exercise_id?: string
          set_order?: number
          reps?: number
          weight?: number
          weight_unit?: 'kg' | 'lb'
          rpe?: number | null
          is_warmup?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'set_entry_session_id_fkey'
            columns: ['session_id']
            referencedRelation: 'workout_session'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'set_entry_exercise_id_fkey'
            columns: ['exercise_id']
            referencedRelation: 'exercise'
            referencedColumns: ['id']
          }
        ]
      }
      personal_record: {
        Row: {
          id: string
          user_id: string
          exercise_id: string
          reps: number
          weight: number
          weight_unit: 'kg' | 'lb'
          estimated_1rm: number | null
          achieved_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_id: string
          reps: number
          weight: number
          weight_unit?: 'kg' | 'lb'
          estimated_1rm?: number | null
          achieved_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_id?: string
          reps?: number
          weight?: number
          weight_unit?: 'kg' | 'lb'
          estimated_1rm?: number | null
          achieved_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'personal_record_exercise_id_fkey'
            columns: ['exercise_id']
            referencedRelation: 'exercise'
            referencedColumns: ['id']
          }
        ]
      }
      template: {
        Row: {
          id: string
          user_id: string
          name: string
          payload: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          payload: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          payload?: Json
          created_at?: string
        }
        Relationships: []
      }
      user_gamification: {
        Row: {
          id: string
          user_id: string
          total_xp: number
          level: number
          current_streak: number
          longest_streak: number
          last_workout_date: string | null
          forgiveness_used_at: string | null
          badges: string[]
          weekly_goal: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_xp?: number
          level?: number
          current_streak?: number
          longest_streak?: number
          last_workout_date?: string | null
          forgiveness_used_at?: string | null
          badges?: string[]
          weekly_goal?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_xp?: number
          level?: number
          current_streak?: number
          longest_streak?: number
          last_workout_date?: string | null
          forgiveness_used_at?: string | null
          badges?: string[]
          weekly_goal?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      unit_weight: 'kg' | 'lb'
    }
  }
}


