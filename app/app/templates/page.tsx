import { createClient } from '@/lib/supabase/server'
import { TemplateManager } from '@/components/templates/template-manager'

export default async function TemplatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Workout Templates</h1>
      <TemplateManager userId={user.id} />
    </div>
  )
}


