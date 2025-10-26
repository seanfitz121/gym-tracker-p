'use client'

import { useMemo } from 'react'
import { HydrationLog } from '@/lib/types/hydration'
import { prepareWeeklyChartData } from '@/lib/utils/hydration'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface WeeklyChartProps {
  logs: HydrationLog[]
  goalMl: number
}

export function WeeklyChart({ logs, goalMl }: WeeklyChartProps) {
  const chartData = useMemo(() => {
    return prepareWeeklyChartData(logs, goalMl)
  }, [logs, goalMl])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Weekly Progress
        </CardTitle>
        <CardDescription>
          Last 7 days of hydration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              label={{
                value: 'ml',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 12, fill: 'hsl(var(--muted-foreground))' },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`${value}ml`, 'Intake']}
              labelFormatter={(label) => label}
            />
            <ReferenceLine
              y={goalMl}
              stroke="#3b82f6"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: 'Goal',
                position: 'right',
                fill: '#3b82f6',
                fontSize: 12,
              }}
            />
            <Bar
              dataKey="total_ml"
              fill="#3b82f6"
              stroke="#2563eb"
              strokeWidth={1}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-600"></div>
            <span>Daily Intake</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 border-t-2 border-dashed border-blue-600"></div>
            <span>Goal Line</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

