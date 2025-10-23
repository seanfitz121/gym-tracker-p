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
          avatar_url: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
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
          daily_xp_earned: number
          rank_code: string | null
          pro_rank_code: string | null
          rank_scale_code: string
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
          daily_xp_earned?: number
          rank_code?: string | null
          pro_rank_code?: string | null
          rank_scale_code?: string
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
          daily_xp_earned?: number
          rank_code?: string | null
          pro_rank_code?: string | null
          rank_scale_code?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_user: {
        Row: {
          user_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      announcement: {
        Row: {
          id: string
          user_id: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          created_at?: string
        }
        Relationships: []
      }
      rank_scale: {
        Row: {
          code: string
          name: string
          description: string | null
          is_premium: boolean
          created_at: string
        }
        Insert: {
          code: string
          name: string
          description?: string | null
          is_premium?: boolean
          created_at?: string
        }
        Update: {
          code?: string
          name?: string
          description?: string | null
          is_premium?: boolean
          created_at?: string
        }
        Relationships: []
      }
      rank_definition: {
        Row: {
          code: string
          scale_code: string
          name: string
          min_xp: number
          icon: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          code: string
          scale_code: string
          name: string
          min_xp: number
          icon?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          code?: string
          scale_code?: string
          name?: string
          min_xp?: number
          icon?: string | null
          color?: string | null
          created_at?: string
        }
        Relationships: []
      }
      blog_post: {
        Row: {
          id: string
          author_id: string
          title: string
          subtitle: string | null
          cover_image_url: string | null
          body: string
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          subtitle?: string | null
          cover_image_url?: string | null
          body: string
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          subtitle?: string | null
          cover_image_url?: string | null
          body?: string
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      patch_notes: {
        Row: {
          id: string
          author_id: string
          version: string
          title: string
          content: string
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          version: string
          title: string
          content: string
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          version?: string
          title?: string
          content?: string
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      premium_subscription: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing'
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          status?: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          status?: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
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


