import { createClient } from '@/lib/supabase/server'
import { WorkoutHistory } from '@/components/history/workout-history'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Workout History</h1>
      <WorkoutHistory userId={user.id} />
    </div>
  )
}


