'use client'

import { useState } from 'react'
import { useGamification } from '@/lib/hooks/use-gamification'
import { useUserRank } from '@/lib/hooks/use-ranks'
import { RankBadge } from '@/components/ranks/rank-badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Trophy, Flame, Star, ChevronDown, ChevronUp } from 'lucide-react'
import { calculateXPProgress, calculateXPForNextLevel } from '@/lib/utils/calculations'

interface GamificationPanelProps {
  userId: string
}

export function GamificationPanel({ userId }: GamificationPanelProps) {
  const { gamification, loading } = useGamification(userId)
  const { rank, loading: rankLoading } = useUserRank(userId)
  const [isOpen, setIsOpen] = useState(false)

  if (loading || !gamification) {
    return null
  }

  const xpProgress = calculateXPProgress(gamification.total_xp) * 100
  const xpForNextLevel = calculateXPForNextLevel(gamification.level)
  const currentLevelXP = gamification.level > 0 ? Math.pow(gamification.level / 0.1, 2) : 0
  const xpInCurrentLevel = gamification.total_xp - currentLevelXP
  const xpNeededForNext = xpForNextLevel - currentLevelXP

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">Level {gamification.level}</span>
                </div>
                {rank && !rankLoading && <RankBadge rank={rank} size="sm" />}
                <Badge variant="secondary">{gamification.total_xp} XP</Badge>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* XP Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Next Level</span>
                <span className="font-medium">
                  {Math.floor(xpInCurrentLevel)} / {Math.floor(xpNeededForNext)} XP
                </span>
              </div>
              <Progress value={xpProgress} className="h-2" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-orange-50 dark:bg-orange-950/30 p-3 rounded-lg">
                <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                <div className="text-xs text-gray-600 dark:text-gray-400">Streak</div>
                <div className="text-lg font-bold">{gamification.current_streak}</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded-lg">
                <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                <div className="text-xs text-gray-600 dark:text-gray-400">Badges</div>
                <div className="text-lg font-bold">{gamification.badges.length}</div>
              </div>
            </div>

            {/* Longest Streak */}
            {gamification.longest_streak > 0 && (
              <div className="text-xs text-center text-gray-500">
                Best: {gamification.longest_streak} day streak
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

