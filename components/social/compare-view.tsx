'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, TrendingUp, Dumbbell, Trophy, Flame, Loader2, Award } from 'lucide-react'
import { RankBadge } from '@/components/ranks/rank-badge'
import { GoldenUsername } from '@/components/gamification/golden-username'
import { createClient } from '@/lib/supabase/client'
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
  is_premium?: boolean
  premium_flair_enabled?: boolean
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
  const [exercises, setExercises] = useState<Array<{id: string, name: string, body_part?: string}>>([])
  const [selectedExercise, setSelectedExercise] = useState<string>('')
  const [prData, setPrData] = useState<{user: any[], friend: any[]} | null>(null)
  const [prLoading, setPrLoading] = useState(false)

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

  // Fetch exercises that both users have done
  useEffect(() => {
    const fetchExercises = async () => {
      if (!data?.user?.id || !data?.friend?.id) return
      
      try {
        const supabase = createClient()
        
        // Get all exercises from set_entries for both users
        const { data: sessions } = await supabase
          .from('workout_session')
          .select('id, user_id')
          .in('user_id', [data.user.id, data.friend.id])
        
        if (!sessions) return

        const sessionIds = sessions.map(s => s.id)
        
        const { data: sets } = await supabase
          .from('set_entry')
          .select('exercise_id, exercise:exercise_id(id, name, body_part)')
          .in('session_id', sessionIds)
        
        if (!sets) return

        // Get unique exercises
        const uniqueExercises = new Map()
        sets.forEach((set: any) => {
          if (set.exercise && !uniqueExercises.has(set.exercise.id)) {
            uniqueExercises.set(set.exercise.id, {
              id: set.exercise.id,
              name: set.exercise.name,
              body_part: set.exercise.body_part
            })
          }
        })

        setExercises(Array.from(uniqueExercises.values()).sort((a, b) => a.name.localeCompare(b.name)))
      } catch (error) {
        console.error('Error fetching exercises:', error)
      }
    }

    if (data) {
      fetchExercises()
    }
  }, [data])

  // Fetch PRs for selected exercise
  useEffect(() => {
    const fetchPRs = async () => {
      if (!selectedExercise || !data?.user?.id || !data?.friend?.id) return
      
      setPrLoading(true)
      try {
        const supabase = createClient()
        
        // Fetch user's PRs
        const { data: userPRs } = await supabase
          .from('personal_record')
          .select('*')
          .eq('exercise_id', selectedExercise)
          .eq('user_id', data.user.id)
          .order('achieved_at', { ascending: false })
        
        // Fetch friend's PRs
        const { data: friendPRs } = await supabase
          .from('personal_record')
          .select('*')
          .eq('exercise_id', selectedExercise)
          .eq('user_id', data.friend.id)
          .order('achieved_at', { ascending: false })
        
        setPrData({
          user: userPRs || [],
          friend: friendPRs || []
        })
      } catch (error) {
        console.error('Error fetching PRs:', error)
      } finally {
        setPrLoading(false)
      }
    }

    fetchPRs()
  }, [selectedExercise, data])

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
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 sm:p-4">
        {/* Mobile: Icon and label at top */}
        <div className="flex items-center justify-center gap-2 mb-3 sm:hidden">
          {icon}
          <p className="text-xs text-gray-500 font-medium">{label}</p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-3 items-center">
          {/* User Stats */}
          <div className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded min-w-0 ${userWins ? 'bg-green-100 dark:bg-green-900/30' : ''}`}>
            <p className="text-lg sm:text-2xl font-bold truncate w-full text-center">
              {userValue.toLocaleString()}{unit}
            </p>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate w-full text-center">
              <GoldenUsername
                username={data.user.display_name}
                isPremium={data.user.is_premium || false}
                flairEnabled={data.user.premium_flair_enabled ?? true}
                showIcon={false}
                className="text-[10px] sm:text-xs"
              />
            </div>
          </div>
          
          {/* Icon and Label - Desktop only */}
          <div className="hidden sm:flex flex-col items-center justify-center px-2">
            {icon}
            <p className="text-xs text-gray-500 mt-1 text-center whitespace-nowrap">{label}</p>
          </div>
          
          {/* Mobile divider */}
          <div className="flex sm:hidden items-center justify-center">
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>
          </div>
          
          {/* Friend Stats */}
          <div className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded min-w-0 ${!userWins && !tie ? 'bg-green-100 dark:bg-green-900/30' : ''}`}>
            <p className="text-lg sm:text-2xl font-bold truncate w-full text-center">
              {friendValue.toLocaleString()}{unit}
            </p>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate w-full text-center">
              <GoldenUsername
                username={data.friend.display_name}
                isPremium={data.friend.is_premium || false}
                flairEnabled={data.friend.premium_flair_enabled ?? true}
                showIcon={false}
                className="text-[10px] sm:text-xs"
              />
            </div>
          </div>
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
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3 min-w-0">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
              <AvatarImage src={data.user.avatar_url || undefined} />
              <AvatarFallback>{data.user.display_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <GoldenUsername
                username={data.user.display_name}
                isPremium={data.user.is_premium || false}
                flairEnabled={data.user.premium_flair_enabled ?? true}
                className="font-semibold text-sm sm:text-base truncate"
                showIcon={true}
              />
              {data.user.rank_code && <RankBadge rankCode={data.user.rank_code} size="sm" />}
              <p className="text-[10px] sm:text-xs text-gray-500 truncate">{data.user.total_xp.toLocaleString()} total XP</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3 min-w-0">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
              <AvatarImage src={data.friend.avatar_url || undefined} />
              <AvatarFallback>{data.friend.display_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <GoldenUsername
                username={data.friend.display_name}
                isPremium={data.friend.is_premium || false}
                flairEnabled={data.friend.premium_flair_enabled ?? true}
                className="font-semibold text-sm sm:text-base truncate"
                showIcon={true}
              />
              {data.friend.rank_code && <RankBadge rankCode={data.friend.rank_code} size="sm" />}
              <p className="text-[10px] sm:text-xs text-gray-500 truncate">{data.friend.total_xp.toLocaleString()} total XP</p>
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

      {/* Exercise PR Comparison */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            <CardTitle>Exercise PRs</CardTitle>
          </div>
          <CardDescription>
            Compare personal records for specific exercises
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedExercise} onValueChange={setSelectedExercise}>
            <SelectTrigger>
              <SelectValue placeholder="Select an exercise to compare PRs..." />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {exercises.map((exercise) => (
                <SelectItem key={exercise.id} value={exercise.id}>
                  {exercise.name}
                  {exercise.body_part && ` • ${exercise.body_part}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedExercise && (
            <>
              {prLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* PR Comparison */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    {/* User's Best PR */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 sm:p-4">
                      <p className="text-xs text-gray-500 mb-2 text-center">{data.user.display_name}</p>
                      {prData && prData.user.length > 0 ? (
                        <div className="space-y-2">
                          {/* Best PR */}
                          <div className={`p-2 sm:p-3 rounded ${prData.user.length > 0 && prData.friend.length > 0 && (prData.user[0].estimated_1rm || 0) > (prData.friend[0]?.estimated_1rm || 0) ? 'bg-green-100 dark:bg-green-900/30' : ''}`}>
                            <p className="text-lg sm:text-2xl font-bold text-center">
                              {prData.user[0].weight} {prData.user[0].weight_unit}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
                              {prData.user[0].reps} {prData.user[0].reps === 1 ? 'rep' : 'reps'}
                            </p>
                            {prData.user[0].estimated_1rm && (
                              <p className="text-[10px] sm:text-xs text-gray-500 text-center mt-1">
                                Est. 1RM: {Math.round(prData.user[0].estimated_1rm)} {prData.user[0].weight_unit}
                              </p>
                            )}
                          </div>
                          {/* Total PRs count */}
                          <p className="text-[10px] sm:text-xs text-gray-500 text-center">
                            {prData.user.length} {prData.user.length === 1 ? 'PR' : 'PRs'}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 text-center py-4">No PRs yet</p>
                      )}
                    </div>

                    {/* Friend's Best PR */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 sm:p-4">
                      <p className="text-xs text-gray-500 mb-2 text-center">{data.friend.display_name}</p>
                      {prData && prData.friend.length > 0 ? (
                        <div className="space-y-2">
                          {/* Best PR */}
                          <div className={`p-2 sm:p-3 rounded ${prData.user.length > 0 && prData.friend.length > 0 && (prData.friend[0].estimated_1rm || 0) > (prData.user[0]?.estimated_1rm || 0) ? 'bg-green-100 dark:bg-green-900/30' : ''}`}>
                            <p className="text-lg sm:text-2xl font-bold text-center">
                              {prData.friend[0].weight} {prData.friend[0].weight_unit}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
                              {prData.friend[0].reps} {prData.friend[0].reps === 1 ? 'rep' : 'reps'}
                            </p>
                            {prData.friend[0].estimated_1rm && (
                              <p className="text-[10px] sm:text-xs text-gray-500 text-center mt-1">
                                Est. 1RM: {Math.round(prData.friend[0].estimated_1rm)} {prData.friend[0].weight_unit}
                              </p>
                            )}
                          </div>
                          {/* Total PRs count */}
                          <p className="text-[10px] sm:text-xs text-gray-500 text-center">
                            {prData.friend.length} {prData.friend.length === 1 ? 'PR' : 'PRs'}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 text-center py-4">No PRs yet</p>
                      )}
                    </div>
                  </div>

                  {/* All PRs History */}
                  {prData && (prData.user.length > 1 || prData.friend.length > 1) && (
                    <div className="border-t pt-4 dark:border-gray-700">
                      <p className="text-sm font-semibold mb-3">PR History</p>
                      <div className="grid grid-cols-2 gap-2 sm:gap-4">
                        {/* User's PR History */}
                        <div className="space-y-2">
                          {prData.user.slice(1, 5).map((pr, index) => (
                            <div key={pr.id} className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-xs">
                              <p className="font-medium">
                                {pr.weight} {pr.weight_unit} × {pr.reps}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                {new Date(pr.achieved_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                        
                        {/* Friend's PR History */}
                        <div className="space-y-2">
                          {prData.friend.slice(1, 5).map((pr, index) => (
                            <div key={pr.id} className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-xs">
                              <p className="font-medium">
                                {pr.weight} {pr.weight_unit} × {pr.reps}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                {new Date(pr.achieved_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
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

