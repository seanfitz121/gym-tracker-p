// Premium Subscription Types
import type { Database } from '../supabase/database.types'

export type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing'

export type PremiumSubscription = Database['public']['Tables']['premium_subscription']['Row']

export interface PremiumFeature {
  id: string
  title: string
  description: string
  icon: string
  comingSoon?: boolean
  link?: string
}

export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: 'ad-free',
    title: 'Ad-Free Experience',
    description: 'Enjoy a completely ad-free experience across the entire app with no distractions',
    icon: '🚫',
  },
  {
    id: 'weight-tracker',
    title: 'Weight Tracker',
    description: 'Track your bodyweight over time with beautiful charts and insights',
    icon: '⚖️',
    link: '/app/weight',
  },
  {
    id: 'hydration-tracker',
    title: 'Hydration Tracker',
    description: 'Monitor your daily water intake and stay hydrated',
    icon: '💧',
    link: '/app/hydration',
  },
  {
    id: 'progress-photos',
    title: 'Progress Photos',
    description: 'Upload and compare transformation photos side-by-side with secure storage',
    icon: '📸',
    link: '/app/progress-photos',
  },
  {
    id: 'supplement-tracker',
    title: 'Supplement Tracker',
    description: 'Track your daily supplement intake, build streaks, and monitor adherence',
    icon: '💊',
    link: '/app/supplements',
  },
  {
    id: 'export-data',
    title: 'Export Workouts',
    description: 'Download your workout history, templates, and weekly summaries as CSV or PDF',
    icon: '📊',
  },
  {
    id: 'prestige-mode',
    title: 'Prestige Mode',
    description: 'Reset your level for exclusive prestige badges and infinite progression',
    icon: '🏆',
  },
  {
    id: 'golden-flair',
    title: 'Golden Name Flair',
    description: 'Stand out with a premium golden username display across the entire app',
    icon: '✨',
  },
  {
    id: 'more-coming',
    title: 'More Coming Soon',
    description: 'We\'re constantly adding new premium features based on your feedback!',
    icon: '🚀',
    comingSoon: true,
  },
]

export const PREMIUM_PRICE = 4 // euros per month

