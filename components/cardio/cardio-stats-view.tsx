'use client'

import { useCardioStats } from '@/lib/hooks/use-cardio'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Activity, Clock, MapPin, Flame, TrendingUp, Calendar } from 'lucide-react'
import { formatDuration, formatPace, metersToDistance } from '@/lib/utils/cardio-calculations'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

interface CardioStatsViewProps {
  userId: string
}

export function CardioStatsView({ userId }: CardioStatsViewProps) {
  const [period, setPeriod] = useState('30')
  const { stats, loading, error } = useCardioStats({
    period: parseInt(period),
  })

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-red-600">
          <p>Error loading stats: {error || 'Unknown error'}</p>
        </CardContent>
      </Card>
    )
  }

  const totalDistanceKm = stats.total_distance ? metersToDistance(stats.total_distance, 'km') : 0

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Statistics</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total_sessions}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.weekly_total} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Total Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatDuration(stats.total_duration)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Across all sessions
            </p>
          </CardContent>
        </Card>

        {stats.total_distance > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Total Distance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {totalDistanceKm.toFixed(1)} km
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.best_distance ? `${metersToDistance(stats.best_distance, 'km').toFixed(2)} km best` : 'No distance recorded'}
              </p>
            </CardContent>
          </Card>
        )}

        {stats.avg_pace && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Average Pace
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formatPace(stats.avg_pace, 'min/km')}
              </p>
              {stats.best_pace && (
                <p className="text-xs text-muted-foreground mt-1">
                  Best: {formatPace(stats.best_pace, 'min/km')}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {stats.total_calories && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Flame className="h-4 w-4" />
                Total Calories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total_calories.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Estimated calories burned
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Monthly Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.monthly_total}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Sessions this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions by Type */}
      {Object.values(stats.sessions_by_type).some(count => count > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sessions by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.sessions_by_type)
                .filter(([_, count]) => count > 0)
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm capitalize">
                      {type.replace('_', ' ')}
                    </span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

