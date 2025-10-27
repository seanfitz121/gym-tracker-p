'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, TrendingUp, Dumbbell, Trophy, Flame, Loader2 } from 'lucide-react'
import { RankBadge } from '@/components/ranks/rank-badge'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface CompareData {
  user: UserStats
  friend: UserStats
  timeline: {
    user: TimelinePoint[]
    friend: TimelinePoint[]
  }
  period_days: number
}

interface UserStats {
  id: string
  display_name: string
  avatar_url?: string | null
  rank_code?: string
  total_xp: number
  current_streak: number
  total_workouts: number
  total_prs: number
  period_stats: {
    xp: number
    workouts: number
    volume_kg: number
    total_sets: number
    prs: number
  }
}

interface TimelinePoint {
  week: number
  xp: number
  workouts: number
  volume_kg: number
}

interface CompareViewProps {
  friendId: string
  onBack: () => void
}

export function CompareView({ friendId, onBack }: CompareViewProps) {
  const [data, setData] = useState<CompareData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<7 | 30 | 90>(7)

  useEffect(() => {
    const fetchCompareData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/compare/${friendId}?days=${period}`)
        if (!res.ok) throw new Error('Failed to fetch comparison data')
        const result = await res.json()
        setData(result)
      } catch (error) {
        console.error('Error fetching comparison:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompareData()
  }, [friendId, period])

  if (loading || !data) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  // Merge timeline data for chart
  const chartData = data.timeline.user.map((userPoint, index) => {
    const friendPoint = data.timeline.friend[index] || { xp: 0, workouts: 0, volume_kg: 0 }
    return {
      week: userPoint.week,
      user_xp: userPoint.xp,
      friend_xp: friendPoint.xp,
      user_volume: userPoint.volume_kg,
      friend_volume: friendPoint.volume_kg
    }
  })

  const StatCard = ({ icon, label, userValue, friendValue, unit = '' }: any) => {
    const userWins = userValue > friendValue
    const tie = userValue === friendValue

    return (
      <div className="grid grid-cols-3 gap-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className={`flex flex-col items-center p-3 rounded ${userWins ? 'bg-green-100 dark:bg-green-900/30' : ''}`}>
          <p className="text-2xl font-bold">{userValue.toLocaleString()}{unit}</p>
          <p className="text-xs text-gray-500">{data.user.display_name}</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          {icon}
          <p className="text-xs text-gray-500 mt-1 text-center">{label}</p>
        </div>
        <div className={`flex flex-col items-center p-3 rounded ${!userWins && !tie ? 'bg-green-100 dark:bg-green-900/30' : ''}`}>
          <p className="text-2xl font-bold">{friendValue.toLocaleString()}{unit}</p>
          <p className="text-xs text-gray-500">{data.friend.display_name}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold">Compare Stats</h2>
      </div>

      {/* User Headers */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={data.user.avatar_url || undefined} />
              <AvatarFallback>{data.user.display_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{data.user.display_name}</p>
              {data.user.rank_code && <RankBadge rankCode={data.user.rank_code} size="sm" />}
              <p className="text-xs text-gray-500">{data.user.total_xp} total XP</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={data.friend.avatar_url || undefined} />
              <AvatarFallback>{data.friend.display_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{data.friend.display_name}</p>
              {data.friend.rank_code && <RankBadge rankCode={data.friend.rank_code} size="sm" />}
              <p className="text-xs text-gray-500">{data.friend.total_xp} total XP</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 justify-center">
        {[7, 30, 90].map((days) => (
          <Button
            key={days}
            variant={period === days ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(days as any)}
          >
            {days} days
          </Button>
        ))}
      </div>

      {/* Period Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Last {period} Days</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
            label="XP Earned"
            userValue={data.user.period_stats.xp}
            friendValue={data.friend.period_stats.xp}
          />
          <StatCard
            icon={<Dumbbell className="h-5 w-5 text-purple-500" />}
            label="Workouts"
            userValue={data.user.period_stats.workouts}
            friendValue={data.friend.period_stats.workouts}
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-orange-500" />}
            label="Total Volume"
            userValue={data.user.period_stats.volume_kg}
            friendValue={data.friend.period_stats.volume_kg}
            unit="kg"
          />
          <StatCard
            icon={<Trophy className="h-5 w-5 text-yellow-500" />}
            label="New PRs"
            userValue={data.user.period_stats.prs}
            friendValue={data.friend.period_stats.prs}
          />
        </CardContent>
      </Card>

      {/* All-Time Stats */}
      <Card>
        <CardHeader>
          <CardTitle>All Time</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <StatCard
            icon={<Dumbbell className="h-5 w-5 text-blue-500" />}
            label="Total Workouts"
            userValue={data.user.total_workouts}
            friendValue={data.friend.total_workouts}
          />
          <StatCard
            icon={<Flame className="h-5 w-5 text-orange-500" />}
            label="Current Streak"
            userValue={data.user.current_streak}
            friendValue={data.friend.current_streak}
            unit=" days"
          />
          <StatCard
            icon={<Trophy className="h-5 w-5 text-yellow-500" />}
            label="Total PRs"
            userValue={data.user.total_prs}
            friendValue={data.friend.total_prs}
          />
        </CardContent>
      </Card>

      {/* Timeline Charts */}
      <Card>
        <CardHeader>
          <CardTitle>XP Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="user_xp"
                stroke="#3b82f6"
                name={data.user.display_name}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="friend_xp"
                stroke="#f59e0b"
                name={data.friend.display_name}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Volume Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="user_volume"
                stroke="#3b82f6"
                name={data.user.display_name}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="friend_volume"
                stroke="#f59e0b"
                name={data.friend.display_name}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

