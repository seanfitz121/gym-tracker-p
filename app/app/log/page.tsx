import { createClient } from '@/lib/supabase/server'
import { WorkoutLogger } from '@/components/workout/workout-logger'
import { GamificationPanel } from '@/components/gamification/gamification-panel'
import { AnnouncementsList } from '@/components/announcements/announcements-list'
import { VolumeStatsCard } from '@/components/stats/volume-stats-card'

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
    </div>
  )
}
