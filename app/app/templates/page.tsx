import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TemplateManager } from '@/components/templates/template-manager'

export const metadata: Metadata = {
  title: 'Workout Templates - Plate Progress',
  description: 'Create and manage your workout templates',
}

export default async function TemplatesPage() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth')
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Workout Templates</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Create templates from your workouts to quickly start your favorite routines
        </p>
      </div>
      <TemplateManager userId={user.id} />
    </div>
  )
}


