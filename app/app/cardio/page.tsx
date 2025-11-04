import { createClient } from '@/lib/supabase/server'
import { CardioHistory } from '@/components/cardio/cardio-history'
import { CardioStatsView } from '@/components/cardio/cardio-stats-view'
import { CardioEntryCard } from '@/components/cardio/cardio-entry-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function CardioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Cardio</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your cardio sessions and progress
        </p>
      </div>

      {/* Quick Entry Card */}
      <CardioEntryCard userId={user.id} />

      {/* Tabs for History and Stats */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="space-y-4 mt-4">
          <CardioHistory userId={user.id} />
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-4 mt-4">
          <CardioStatsView userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

