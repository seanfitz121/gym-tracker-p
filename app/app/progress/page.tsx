import { createClient } from '@/lib/supabase/server'
import { ProgressDashboard } from '@/components/progress/progress-dashboard'

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Progress & PRs</h1>
      <ProgressDashboard userId={user.id} />
    </div>
  )
}


