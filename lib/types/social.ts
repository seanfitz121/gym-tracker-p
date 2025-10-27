// Social features types: Friends, Leaderboards, Gyms, Anti-cheat

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected'
export type FriendRequestPrivacy = 'anyone' | 'friends_of_friends' | 'nobody'
export type AntiCheatFlagType = 'xp_spike' | 'volume_spike' | 'impossible_set' | 'scripted_behavior' | 'new_account'
export type AntiCheatSeverity = 'low' | 'medium' | 'high'
export type AntiCheatStatus = 'pending' | 'cleared' | 'confirmed'

// ============================================================================
// GYMS
// ============================================================================

export interface Gym {
  code: string
  name: string
  description?: string | null
  owner_id?: string | null
  is_verified: boolean
  require_approval: boolean
  created_at: string
  updated_at: string
}

export interface GymMember {
  gym_code: string
  user_id: string
  joined_at: string
  opt_in: boolean
  is_approved: boolean
}

export interface GymWithStats extends Gym {
  member_count: number
  user_is_member: boolean
  user_is_owner: boolean
}

// ============================================================================
// FRIENDS
// ============================================================================

export interface FriendRequest {
  id: string
  from_user: string
  to_user: string
  status: FriendRequestStatus
  created_at: string
  updated_at: string
}

export interface FriendRequestWithProfile extends FriendRequest {
  from_profile?: {
    display_name?: string | null
    avatar_url?: string | null
    rank_code?: string | null
  }
  to_profile?: {
    display_name?: string | null
    avatar_url?: string | null
    rank_code?: string | null
  }
}

export interface Friend {
  user_id: string
  friend_id: string
  created_at: string
}

export interface FriendWithStats {
  user_id: string
  display_name?: string | null
  avatar_url?: string | null
  rank_code?: string | null
  weekly_xp: number
  total_workouts: number
  current_streak: number
  top_pr?: {
    exercise_name: string
    weight: number
    weight_unit: string
    reps: number
  } | null
}

// ============================================================================
// WEEKLY XP & LEADERBOARDS
// ============================================================================

export interface WeeklyXp {
  user_id: string
  iso_week: number
  xp: number
  workouts: number
  volume_kg: number
  pr_count: number
  gym_code?: string | null
  created_at: string
  updated_at: string
}

export interface LeaderboardEntry {
  user_id: string
  display_name?: string | null
  avatar_url?: string | null
  rank_code?: string | null
  rank: number
  xp: number
  workouts: number
  volume_kg: number
  pr_count: number
  delta?: number // Change since last period
  is_flagged?: boolean
  is_new_account?: boolean
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[]
  user_entry?: LeaderboardEntry
  total_participants: number
  page: number
  total_pages: number
}

export type LeaderboardType = 'global' | 'friends' | 'gym'
export type LeaderboardRange = 'week' | 'month' | 'all'

// ============================================================================
// COMPARE
// ============================================================================

export interface ComparisonMetric {
  user_value: number
  friend_value: number
  user_label: string
  friend_label: string
}

export interface ComparisonData {
  user: {
    user_id: string
    display_name?: string | null
    avatar_url?: string | null
    rank_code?: string | null
  }
  friend: {
    user_id: string
    display_name?: string | null
    avatar_url?: string | null
    rank_code?: string | null
  }
  metrics: {
    weekly_xp: ComparisonMetric
    total_volume: ComparisonMetric
    pr_count: ComparisonMetric
    streak_length: ComparisonMetric
    workouts_this_week: ComparisonMetric
  }
  timeline: {
    dates: string[]
    user_xp: number[]
    friend_xp: number[]
  }
}

// ============================================================================
// ANTI-CHEAT
// ============================================================================

export interface AntiCheatFlag {
  id: string
  user_id: string
  flag_type: AntiCheatFlagType
  severity: AntiCheatSeverity
  status: AntiCheatStatus
  details?: Record<string, any> | null
  flagged_at: string
  reviewed_at?: string | null
  reviewed_by?: string | null
  notes?: string | null
}

export interface AntiCheatFlagWithUser extends AntiCheatFlag {
  user_profile?: {
    display_name?: string | null
    avatar_url?: string | null
  }
}

export interface AntiCheatThresholds {
  max_xp_per_hour: number
  max_xp_per_session: number
  max_volume_per_session_kg: number
  max_weight_kg: number
  max_reps: number
  xp_spike_multiplier: number // Flag if >Nx 90-day median
}

// ============================================================================
// PRIVACY SETTINGS
// ============================================================================

export interface PrivacySettings {
  friend_request_privacy: FriendRequestPrivacy
  show_on_global_leaderboard: boolean
  show_on_gym_leaderboard: boolean
  friends_list_public: boolean
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface SendFriendRequestPayload {
  to_user_id: string
}

export interface AcceptFriendRequestPayload {
  request_id: string
}

export interface RejectFriendRequestPayload {
  request_id: string
}

export interface CreateGymPayload {
  code: string
  name: string
  description?: string
  require_approval?: boolean
}

export interface JoinGymPayload {
  gym_code: string
}

export interface LeaderboardQuery {
  type: LeaderboardType
  range: LeaderboardRange
  gym_code?: string
  page?: number
  limit?: number
}

export interface CompareQuery {
  friend_id: string
  range: 7 | 30 | 90
}

