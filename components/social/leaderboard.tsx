'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Trophy, Users, Dumbbell, Globe, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { RankBadge } from '@/components/ranks/rank-badge'
import type { LeaderboardType, LeaderboardRange } from '@/lib/types'

interface LeaderboardEntry {
  user_id: string
  display_name: string
  avatar_url?: string | null
  rank_code?: string
  rank: number
  xp: number
  workouts: number
  volume_kg: number
  pr_count: number
  is_flagged?: boolean
  is_new_account?: boolean
}

interface LeaderboardData {
  entries: LeaderboardEntry[]
  user_entry: LeaderboardEntry | null
  total_participants: number
  page: number
  total_pages: number
}

interface LeaderboardProps {
  userId: string
  currentGymCode?: string | null
}

export function Leaderboard({ userId, currentGymCode }: LeaderboardProps) {
  const [type, setType] = useState<LeaderboardType>('friends')
  const [range, setRange] = useState<LeaderboardRange>('week')
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      try {
        let url = `/api/leaderboard?type=${type}&range=${range}&page=${page}`
        if (type === 'gym' && currentGymCode) {
          url += `&gym_code=${currentGymCode}`
        }

        const res = await fetch(url)
        if (!res.ok) throw new Error('Failed to fetch leaderboard')
        const result = await res.json()
        setData(result)
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [type, range, page, currentGymCode])

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500'
    if (rank === 2) return 'text-gray-400'
    if (rank === 3) return 'text-orange-600'
    return 'text-gray-600'
  }

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <Trophy className={`h-5 w-5 ${getRankColor(rank)}`} />
    }
    return <span className="text-gray-500 font-semibold text-sm">#{rank}</span>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Leaderboards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={type} onValueChange={(v) => { setType(v as LeaderboardType); setPage(1) }}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="friends">
                <Users className="h-4 w-4 mr-2" />
                Friends
              </TabsTrigger>
              {currentGymCode && (
                <TabsTrigger value="gym">
                  <Dumbbell className="h-4 w-4 mr-2" />
                  Gym
                </TabsTrigger>
              )}
              <TabsTrigger value="global">
                <Globe className="h-4 w-4 mr-2" />
                Global
              </TabsTrigger>
            </TabsList>

            {/* Range Selector */}
            <div className="flex gap-2 mt-4 justify-center">
              {(['week', 'month', 'all'] as LeaderboardRange[]).map((r) => (
                <Button
                  key={r}
                  variant={range === r ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setRange(r); setPage(1) }}
                >
                  {r === 'week' ? 'This Week' : r === 'month' ? 'This Month' : 'All Time'}
                </Button>
              ))}
            </div>

            <TabsContent value={type} className="mt-4">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : !data || data.entries.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  {type === 'friends' && 'Add friends to see their rankings'}
                  {type === 'gym' && 'Join a gym to compete on gym leaderboards'}
                  {type === 'global' && 'No participants yet'}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {data.entries.map((entry, index) => (
                      <div
                        key={entry.user_id}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          entry.user_id === userId
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                            : 'bg-gray-50 dark:bg-gray-900'
                        }`}
                      >
                        <div className="flex items-center justify-center w-8">
                          {getRankIcon(entry.rank)}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={entry.avatar_url || undefined} />
                          <AvatarFallback>{entry.display_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{entry.display_name}</p>
                            {entry.is_new_account && (
                              <Badge variant="outline" className="text-xs">New</Badge>
                            )}
                            {entry.is_flagged && (
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          {entry.rank_code && (
                            <RankBadge rankCode={entry.rank_code} size="sm" />
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{entry.xp.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">XP</p>
                        </div>
                        <div className="text-right hidden sm:block">
                          <p className="font-semibold">{entry.workouts}</p>
                          <p className="text-xs text-gray-500">workouts</p>
                        </div>
                        <div className="text-right hidden sm:block">
                          <p className="font-semibold">{entry.volume_kg.toLocaleString()}kg</p>
                          <p className="text-xs text-gray-500">volume</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* User's Rank (if not on current page) */}
                  {data.user_entry && !data.entries.some(e => e.user_id === userId) && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-500 mb-2">Your Rank</p>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500">
                        <div className="flex items-center justify-center w-8">
                          <span className="text-gray-600 font-semibold text-sm">#{data.user_entry.rank}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">You</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{data.user_entry.xp.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">XP</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pagination */}
                  {data.total_pages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-sm text-gray-500">
                        Page {page} of {data.total_pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                        disabled={page === data.total_pages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

