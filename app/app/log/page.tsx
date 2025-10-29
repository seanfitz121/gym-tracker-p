import { createClient } from '@/lib/supabase/server'
import { WorkoutLogger } from '@/components/workout/workout-logger'
import { GamificationPanel } from '@/components/gamification/gamification-panel'
import { AnnouncementsList } from '@/components/announcements/announcements-list'
import { VolumeStatsCard } from '@/components/stats/volume-stats-card'
import { AdBanner } from '@/components/ads/ad-banner'
import { AD_SLOTS } from '@/lib/config/ads'

export default async function LogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-4">
      <AnnouncementsList />
      <GamificationPanel userId={user.id} />
      <VolumeStatsCard userId={user.id} />
      <WorkoutLogger userId={user.id} />
      
      {/* Ad - Bottom banner after workout logger (free users only) */}
      <div className="pt-2">
        <AdBanner 
          adSlot={AD_SLOTS.BOTTOM_BANNER}
          adFormat="auto"
          showPlaceholder={true}
          className="max-w-3xl mx-auto"
        />
      </div>
    </div>
  )
}
