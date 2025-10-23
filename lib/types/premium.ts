// Premium Subscription Types

export type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing'

export interface PremiumSubscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface PremiumFeature {
  id: string
  title: string
  description: string
  icon: string
  comingSoon?: boolean
}

export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: 'weight-tracker',
    title: 'Weight Tracker',
    description: 'Track your bodyweight over time with beautiful charts and insights',
    icon: '⚖️',
    comingSoon: true,
  },
  {
    id: 'hydration-tracker',
    title: 'Hydration Tracker',
    description: 'Monitor your daily water intake and stay hydrated',
    icon: '💧',
    comingSoon: true,
  },
  {
    id: 'progress-photos',
    title: 'Progress Photos',
    description: 'Upload and compare transformation photos side-by-side',
    icon: '📸',
    comingSoon: true,
  },
  {
    id: 'export-data',
    title: 'Export Workouts',
    description: 'Download your workout history as CSV or PDF',
    icon: '📊',
    comingSoon: true,
  },
  {
    id: 'prestige-mode',
    title: 'Prestige Mode',
    description: 'Reset your level for exclusive prestige badges and rewards',
    icon: '🏆',
    comingSoon: true,
  },
  {
    id: 'golden-flair',
    title: 'Golden Name Flair',
    description: 'Stand out with a premium golden username display',
    icon: '✨',
    comingSoon: true,
  },
]

export const PREMIUM_PRICE = 4 // euros per month

