import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ToolsPage } from '@/components/tools/tools-page'

export const metadata: Metadata = {
  title: 'Tools - Plate Progress',
  description: 'Access your fitness tracking tools and utilities',
}

export default async function ToolsPageRoute() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth')
  }

  return <ToolsPage />
}

