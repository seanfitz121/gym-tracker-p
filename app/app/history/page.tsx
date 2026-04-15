import { createClient } from '@/lib/supabase/server'
import { WorkoutHistoryCalendar } from '@/components/history/workout-history-calendar'
import { AdBanner } from '@/components/ads/ad-banner'
import { AD_SLOTS } from '@/lib/config/ads'
import { AppScreen } from '@/components/ui/app-ui'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return (
    <AppScreen
      eyebrow="Training log"
      title="Every session, kept honest."
      description="Review weekly work, open completed sessions, and export what you need."
      className="max-w-4xl space-y-6"
    >
      <WorkoutHistoryCalendar userId={user.id} />
      
      {/* Ad - Content separator at bottom (free users only) */}
      <div className="pt-4">
        <AdBanner 
          adSlot={AD_SLOTS.CONTENT_SEPARATOR}
          adFormat="auto"
          showPlaceholder={true}
          className="max-w-3xl mx-auto"
        />
      </div>
    </AppScreen>
  )
}


