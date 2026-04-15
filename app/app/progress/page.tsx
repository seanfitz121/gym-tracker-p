import { createClient } from '@/lib/supabase/server'
import { ProgressDashboard } from '@/components/progress/progress-dashboard'
import { AdBanner } from '@/components/ads/ad-banner'
import { AD_SLOTS } from '@/lib/config/ads'
import { AppScreen } from '@/components/ui/app-ui'

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return (
    <AppScreen
      eyebrow="Progress lab"
      title="Proof you’re getting stronger."
      description="PRs, estimated strength, goals, and trends in one clean view."
      className="max-w-4xl space-y-6"
    >
      <ProgressDashboard userId={user.id} />
      
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


