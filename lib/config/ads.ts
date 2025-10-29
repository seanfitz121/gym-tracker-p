/**
 * Google AdSense Configuration
 * All ad slot IDs for the application
 */

export const AD_SLOTS = {
  // Bottom Banner - For workout logger, after user completes action
  BOTTOM_BANNER: '4020668929',
  
  // Content Separator - Between content sections
  CONTENT_SEPARATOR: '7009794341',
  
  // Dashboard Ad - At bottom of dashboard
  DASHBOARD_SIDEBAR: '7306690705',
} as const

export const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-9610700167630671'
