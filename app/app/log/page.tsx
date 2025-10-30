import { createClient } from '@/lib/supabase/server'
import { WorkoutLogger } from '@/components/workout/workout-logger'
import { AnnouncementsList } from '@/components/announcements/announcements-list'
import { AdBanner } from '@/components/ads/ad-banner'
import { AD_SLOTS } from '@/lib/config/ads'

export default async function LogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20">
      <div className="container max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-4">
        <AnnouncementsList />
        <WorkoutLogger userId={user.id} />
        
        {/* Ad - Bottom banner after workout logger (free users only) */}
        <div className="pt-2 pb-4">
          <AdBanner 
            adSlot={AD_SLOTS.BOTTOM_BANNER}
            adFormat="auto"
            showPlaceholder={true}
            className="max-w-3xl mx-auto"
          />
        </div>
      </div>
    </div>
  )
}
