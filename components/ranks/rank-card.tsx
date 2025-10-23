'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RankBadge } from './rank-badge'
import { useRankProgress } from '@/lib/hooks/use-ranks'
import { Skeleton } from '@/components/ui/skeleton'

interface RankCardProps {
  userId: string
}

export function RankCard({ userId }: RankCardProps) {
  const { progress, loading } = useRankProgress(userId)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rank</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </Card>
    )
  }

  if (!progress) {
    return null
  }

  const { currentRank, nextRank, progress: progressValue, xpToNext, totalXp } = progress

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Rank</CardTitle>
          <RankBadge rank={currentRank} size="sm" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{currentRank.name}</span>
            {nextRank && (
              <span className="text-gray-500">
                {xpToNext} XP to {nextRank.name}
              </span>
            )}
            {!nextRank && currentRank.isAdmin && (
              <span className="text-gray-500">Max Rank</span>
            )}
            {!nextRank && !currentRank.isAdmin && (
              <span className="text-gray-500">Max Rank Achieved! 👑</span>
            )}
          </div>
          
          {nextRank && (
            <Progress value={progressValue * 100} className="h-2" />
          )}
          
          <div className="text-xs text-gray-500">
            Total XP: <span className="font-semibold text-gray-700 dark:text-gray-300">{totalXp.toLocaleString()}</span>
          </div>
        </div>

        {nextRank && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Next Rank</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{nextRank.name}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


