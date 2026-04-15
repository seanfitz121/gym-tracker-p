import { createClient } from '@/lib/supabase/server'
import { WorkoutLogger } from '@/components/workout/workout-logger'
import { AnnouncementsList } from '@/components/announcements/announcements-list'
import { AdBanner } from '@/components/ads/ad-banner'
import { AD_SLOTS } from '@/lib/config/ads'
import { AppScreen } from '@/components/ui/app-ui'

export default async function LogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return (
    <AppScreen
      eyebrow="Workout logger"
      title="Train now. Sort the details later."
      description="Large tap targets, clear set entry, and a finish action that stays close."
      className="max-w-4xl space-y-4"
    >
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
    </AppScreen>
  )
}
