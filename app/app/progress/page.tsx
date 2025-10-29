import { createClient } from '@/lib/supabase/server'
import { ProgressDashboard } from '@/components/progress/progress-dashboard'
import { AdBanner } from '@/components/ads/ad-banner'
import { AD_SLOTS } from '@/lib/config/ads'

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Progress & PRs</h1>
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
    </div>
  )
}


