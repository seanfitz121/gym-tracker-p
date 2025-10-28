// Prestige Mode Types

export interface PrestigeHistory {
  id: string;
  user_id: string;
  prestige_number: number;
  xp_before: number;
  level_before: number;
  xp_after: number;
  level_after: number;
  created_at: string;
}

export interface PrestigeEligibility {
  eligible: boolean;
  reason?: string;
  prestige_count: number;
  current_xp?: number;
  required_xp?: number;
  last_prestige_at?: string;
  next_eligible_at?: string;
  days_remaining?: number;
}

export interface PrestigeEnterResponse {
  success: boolean;
  error?: string;
  prestige_count?: number;
  badge_name?: string;
  next_eligible_at?: string;
}

export interface PrestigeStatusResponse {
  isEligible: boolean;
  prestige_count: number;
  last_prestige_at: string | null;
  next_eligible_at: string | null;
  reason?: string;
  current_xp?: number;
  required_xp?: number;
  days_remaining?: number;
}

// Golden Name Flair Types
export interface FlairSettings {
  premium_flair_enabled: boolean;
}

export interface UpdateFlairRequest {
  premium_flair_enabled: boolean;
}

export interface UpdateFlairResponse {
  success: boolean;
  premium_flair_enabled: boolean;
}

