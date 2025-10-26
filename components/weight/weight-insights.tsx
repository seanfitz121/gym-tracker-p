'use client'

import { useMemo } from 'react'
import { WeightLog } from '@/lib/types/weight'
import { calculateWeightInsights, generateInsightMessage } from '@/lib/utils/weight-insights'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingDown, TrendingUp, Target, Calendar, Trophy, Scale } from 'lucide-react'

interface WeightInsightsProps {
  logs: WeightLog[]
  unit: 'kg' | 'lb'
}

export function WeightInsights({ logs, unit }: WeightInsightsProps) {
  const insights = useMemo(() => {
    return calculateWeightInsights(logs, unit)
  }, [logs, unit])

  const insightMessage = useMemo(() => {
    return generateInsightMessage(insights)
  }, [insights])

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
          <CardDescription>Track your progress with smart insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Start logging your weight to see insights
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Insights
        </CardTitle>
        <CardDescription>Your progress at a glance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Insight Message */}
        {insightMessage && (
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
            <p className="text-sm font-medium">{insightMessage}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Latest Weight */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Scale className="h-4 w-4" />
              <span className="text-xs font-medium">Latest</span>
            </div>
            <p className="text-2xl font-bold">
              {insights.latestWeight?.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
            </p>
          </div>

          {/* Weekly Average */}
          {insights.weeklyAverage !== null && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-xs font-medium">7-Day Avg</span>
              </div>
              <p className="text-2xl font-bold">
                {insights.weeklyAverage.toFixed(1)}
                <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
              </p>
            </div>
          )}

          {/* Tracking Streak */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span className="text-xs font-medium">Streak</span>
            </div>
            <p className="text-2xl font-bold">
              {insights.trackingStreak}
              <span className="text-sm font-normal text-muted-foreground ml-1">days</span>
            </p>
          </div>

          {/* Total Entries */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Badge variant="outline" className="text-xs">Total</Badge>
            </div>
            <p className="text-2xl font-bold">
              {insights.totalEntries}
              <span className="text-sm font-normal text-muted-foreground ml-1">logs</span>
            </p>
          </div>
        </div>

        {/* Weight Changes */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="text-sm font-semibold">Weight Changes</h4>
          <div className="grid gap-2">
            {insights.weightChange7Days !== null && (
              <WeightChangeBadge
                label="Last 7 days"
                change={insights.weightChange7Days}
                unit={unit}
              />
            )}
            {insights.weightChange30Days !== null && (
              <WeightChangeBadge
                label="Last 30 days"
                change={insights.weightChange30Days}
                unit={unit}
              />
            )}
            {insights.weightChange90Days !== null && (
              <WeightChangeBadge
                label="Last 90 days"
                change={insights.weightChange90Days}
                unit={unit}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function WeightChangeBadge({
  label,
  change,
  unit,
}: {
  label: string
  change: number
  unit: string
}) {
  const isPositive = change > 0
  const isNeutral = Math.abs(change) < 0.1

  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className={`flex items-center gap-1 font-semibold text-sm ${
        isNeutral ? 'text-muted-foreground' : isPositive ? 'text-red-600' : 'text-green-600'
      }`}>
        {!isNeutral && (isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />)}
        {isPositive && '+'}
        {change.toFixed(1)} {unit}
      </div>
    </div>
  )
}


