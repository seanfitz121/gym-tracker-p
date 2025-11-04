export type NotificationType =
  | 'friend_request'
  | 'workout_reminder'
  | 'community_interaction'
  | 'patch_notes'
  | 'gym_expiry'

export interface PushSubscription {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  data?: Record<string, any>
  read: boolean
  created_at: string
  read_at: string | null
}

export interface NotificationPreferences {
  id: string
  user_id: string
  friend_requests: boolean
  workout_reminders: boolean
  community_interactions: boolean
  patch_notes: boolean
  gym_expiry: boolean
  push_enabled: boolean
  created_at: string
  updated_at: string
}

export interface PushSubscriptionFormData {
  endpoint: string
  p256dh: string
  auth: string
}

