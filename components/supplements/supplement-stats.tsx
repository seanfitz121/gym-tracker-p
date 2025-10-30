'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Target, Calendar, Flame } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import type { SupplementStats } from '@/lib/types/supplement'

interface SupplementStatsProps {
  userId: string
}

export function SupplementStats({ userId }: SupplementStatsProps) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<SupplementStats[]>([])
  const [days, setDays] = useState('30')

  useEffect(() => {
    fetchStats()
  }, [days])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/supplements/stats?days=${days}`)

      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }

      const data = await response.json()
      setStats(data.stats || [])
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading && stats.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    )
  }

  if (stats.length === 0) {
    return (
      <div className="text-center py-16">
        <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">No Statistics Yet</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Start logging your supplements to see analytics and track your adherence over time.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Analytics</h2>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4">
        {stats.map((stat) => (
          <div
            key={stat.supplement_id}
            className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-950 border border-blue-200 dark:border-blue-900 shadow-sm"
          >
            <div className="p-5 sm:p-6">
              {/* Header */}
              <div className="mb-5">
                <h3 className="text-lg font-bold mb-1">{stat.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {stat.type} • {stat.daily_goal} {stat.unit}/day
                </p>
              </div>

              {/* Grid Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {/* Adherence */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg p-3 border border-purple-100 dark:border-purple-900/50">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Adherence
                  </span>
                </div>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {stat.adherence_percentage}%
                </div>
              </div>

              {/* Current Streak */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-lg p-3 border border-orange-100 dark:border-orange-900/50">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Streak
                  </span>
                </div>
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {stat.current_streak}
                </div>
              </div>

              {/* Days Logged */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg p-3 border border-blue-100 dark:border-blue-900/50">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Days
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {stat.days_logged}
                </div>
              </div>

              {/* Average */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg p-3 border border-green-100 dark:border-green-900/50">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Avg/Day
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {stat.average_daily_intake}
                </div>
              </div>
            </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Days met goal:</span>
                  <span className="font-semibold">{stat.days_met_goal}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Longest streak:</span>
                  <span className="font-semibold">{stat.longest_streak} days</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Total logs:</span>
                  <span className="font-semibold">{stat.total_logs}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Unit:</span>
                  <span className="font-semibold">{stat.unit}</span>
                </div>
              </div>

              {/* Progress insight */}
              {stat.current_streak > 0 && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    🎉 Great job! You've hit your goal for {stat.current_streak} day
                    {stat.current_streak > 1 ? 's' : ''} in a row!
                  </p>
                </div>
              )}

              {stat.adherence_percentage < 50 && stat.days_logged > 3 && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    💪 Keep going! Try to log consistently to build a healthy habit.
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

