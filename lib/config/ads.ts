/**
 * Google AdSense Configuration
 * 
 * After setting up AdSense:
 * 1. Replace ad slot IDs with your actual slot IDs
 * 2. Add NEXT_PUBLIC_ADSENSE_CLIENT_ID to .env.local
 */

export const AD_SLOTS = {
  // Dashboard - sidebar banner
  DASHBOARD_SIDEBAR: 'your-ad-slot-id-1',
  
  // History page - between workout cards
  HISTORY_INLINE: 'your-ad-slot-id-2',
  
  // Social page - bottom banner
  SOCIAL_BOTTOM: 'your-ad-slot-id-3',
  
  // Templates page - top banner
  TEMPLATES_TOP: 'your-ad-slot-id-4',
  
  // Progress page - sidebar
  PROGRESS_SIDEBAR: 'your-ad-slot-id-5',
} as const

export const AD_CONFIG = {
  // Whether ads are enabled globally
  enabled: process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true',
  
  // AdSense client ID (starts with ca-pub-)
  clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
} as const

