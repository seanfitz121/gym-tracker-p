'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Trophy, Dumbbell, Shield, Settings, MessageSquare, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { FriendsList } from './friends-list'
import { SendFriendRequestDialog } from './send-friend-request-dialog'
import { CompareView } from './compare-view'
import { Leaderboard } from './leaderboard'
import { GymManager } from './gym-manager'
import { PrivacySettings } from './privacy-settings'
import { AdminModeration } from './admin-moderation'
import { AdBanner } from '@/components/ads/ad-banner'
import { AD_SLOTS } from '@/lib/config/ads'

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

      {/* Community Link Card */}
      <Link href="/app/community" className="block mb-6">
        <Card className="cursor-pointer hover:border-cyan-400 dark:hover:border-cyan-600 transition-colors bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-cyan-100 dark:bg-cyan-900 p-3">
                <MessageSquare className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Join the Community</h3>
                <p className="text-sm text-muted-foreground mt-1">Share posts, get tips, and connect with lifters</p>
              </div>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1">
          <TabsTrigger value="friends" className="flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2.5">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Friends</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboards" className="flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2.5">
            <Trophy className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Leaderboards</span>
          </TabsTrigger>
          <TabsTrigger value="gym" className="flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2.5">
            <Dumbbell className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Gym</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2.5">
            <Settings className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Privacy</span>
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

      {/* Ad - Content separator at bottom (free users only) */}
      <div className="pt-4">
        <AdBanner 
          adSlot={AD_SLOTS.CONTENT_SEPARATOR}
          adFormat="auto"
          showPlaceholder={true}
          className="max-w-3xl mx-auto"
        />
      </div>

      {isAdmin && (
        <div className="fixed bottom-4 right-4">
          <Shield className="h-6 w-6 text-yellow-500" />
        </div>
      )}
    </div>
  )
}

