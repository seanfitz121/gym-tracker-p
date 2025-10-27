'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Trophy, Dumbbell, Shield, Settings } from 'lucide-react'
import { FriendsList } from './friends-list'
import { SendFriendRequestDialog } from './send-friend-request-dialog'
import { CompareView } from './compare-view'
import { Leaderboard } from './leaderboard'
import { GymManager } from './gym-manager'
import { PrivacySettings } from './privacy-settings'
import { AdminModeration } from './admin-moderation'

interface SocialPageProps {
  userId: string
}

export function SocialPage({ userId }: SocialPageProps) {
  const [compareWith, setCompareWith] = useState<string | null>(null)
  const [currentGymCode, setCurrentGymCode] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Check if user is admin (you could fetch this from an API)
  // For now, we'll assume non-admin until we implement admin check
  // useEffect(() => {
  //   const checkAdmin = async () => {
  //     const res = await fetch('/api/admin/check')
  //     if (res.ok) {
  //       const data = await res.json()
  //       setIsAdmin(data.is_admin)
  //     }
  //   }
  //   checkAdmin()
  // }, [])

  if (compareWith) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <CompareView friendId={compareWith} onBack={() => setCompareWith(null)} />
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Social</h1>
        <SendFriendRequestDialog />
      </div>

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="friends">
            <Users className="h-4 w-4 mr-2" />
            Friends
          </TabsTrigger>
          <TabsTrigger value="leaderboards">
            <Trophy className="h-4 w-4 mr-2" />
            Leaderboards
          </TabsTrigger>
          <TabsTrigger value="gym">
            <Dumbbell className="h-4 w-4 mr-2" />
            Gym
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Settings className="h-4 w-4 mr-2" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-4">
          <FriendsList userId={userId} onCompare={(friendId) => setCompareWith(friendId)} />
        </TabsContent>

        <TabsContent value="leaderboards" className="mt-4">
          <Leaderboard userId={userId} currentGymCode={currentGymCode} />
        </TabsContent>

        <TabsContent value="gym" className="mt-4">
          <GymManager userId={userId} onGymChange={setCurrentGymCode} />
        </TabsContent>

        <TabsContent value="privacy" className="mt-4">
          <PrivacySettings userId={userId} />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin" className="mt-4">
            <AdminModeration />
          </TabsContent>
        )}
      </Tabs>

      {isAdmin && (
        <div className="fixed bottom-4 right-4">
          <Shield className="h-6 w-6 text-yellow-500" />
        </div>
      )}
    </div>
  )
}

