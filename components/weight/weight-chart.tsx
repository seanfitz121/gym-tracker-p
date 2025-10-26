'use client'

import { useMemo } from 'react'
import { WeightLog } from '@/lib/types/weight'
import { prepareChartData } from '@/lib/utils/weight-insights'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { TrendingDown, TrendingUp } from 'lucide-react'
import {
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from 'recharts'
import { useState } from 'react'
import { format, parseISO } from 'date-fns'

// Bright colors that work well in both light and dark mode
const CHART_COLORS = {
  line: '#3b82f6', // Bright blue
  lineAlt: '#8b5cf6', // Purple alternative
  fill: '#3b82f6',
  dot: '#3b82f6',
  dotBorder: '#ffffff',
  grid: '#94a3b8',
  text: '#64748b',
}

interface WeightChartProps {
  logs: WeightLog[]
  unit: 'kg' | 'lb'
}

export function WeightChart({ logs, unit }: WeightChartProps) {
  const [smoothing, setSmoothing] = useState(false)

  const chartData = useMemo(() => {
    return prepareChartData(logs, unit, smoothing)
  }, [logs, unit, smoothing])

  // Calculate trend
  const trend = useMemo(() => {
    if (chartData.length < 2) return null
    const first = chartData[0].weight
    const last = chartData[chartData.length - 1].weight
    return last - first
  }, [chartData])

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weight Over Time</CardTitle>
          <CardDescription>Your weight progress will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No weight data yet. Start logging to see your progress!
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Weight Over Time
              {trend !== null && (
                <span className={`text-sm flex items-center gap-1 ${trend >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {trend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {Math.abs(trend).toFixed(1)}{unit}
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Visualize your bodyweight progress over time
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="smoothing"
              checked={smoothing}
              onCheckedChange={setSmoothing}
            />
            <Label htmlFor="smoothing" className="text-sm cursor-pointer">
              Smooth
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={380}>
          <AreaChart 
            data={chartData}
            margin={{ top: 25, right: 15, left: 5, bottom: 5 }}
          >
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.fill} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={CHART_COLORS.fill} stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={CHART_COLORS.grid} 
              opacity={0.3}
            />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 11, fill: CHART_COLORS.text }}
              tickLine={{ stroke: CHART_COLORS.grid }}
              axisLine={{ stroke: CHART_COLORS.grid }}
              height={40}
            />
            <YAxis
              domain={['dataMin - 2', 'dataMax + 2']}
              tick={{ fontSize: 11, fill: CHART_COLORS.text }}
              tickLine={{ stroke: CHART_COLORS.grid }}
              axisLine={{ stroke: CHART_COLORS.grid }}
              width={50}
              label={{
                value: unit,
                angle: -90,
                position: 'insideLeft',
                style: { 
                  fontSize: 11, 
                  fill: CHART_COLORS.text,
                  textAnchor: 'middle'
                },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              labelStyle={{
                color: 'hsl(var(--foreground))',
                fontWeight: 600,
                marginBottom: '4px',
              }}
              formatter={(value: number) => [
                `${value} ${unit}`, 
                'Weight'
              ]}
              labelFormatter={(label) => {
                // Find the matching data point to get the full date
                const dataPoint = chartData.find(d => d.displayDate === label)
                if (dataPoint) {
                  return format(parseISO(dataPoint.date), 'EEEE, MMMM d, yyyy')
                }
                return label
              }}
            />
            <Area
              type="monotone"
              dataKey="weight"
              stroke={CHART_COLORS.line}
              strokeWidth={3}
              fill="url(#weightGradient)"
              dot={{ 
                fill: CHART_COLORS.dot, 
                stroke: CHART_COLORS.dotBorder,
                strokeWidth: 2,
                r: 5 
              }}
              activeDot={{ 
                r: 7,
                fill: CHART_COLORS.dot,
                stroke: CHART_COLORS.dotBorder,
                strokeWidth: 3
              }}
            >
              <LabelList
                dataKey="weight"
                position="top"
                offset={10}
                formatter={(value: any) => `${value}`}
                style={{
                  fill: CHART_COLORS.line,
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              />
            </Area>
          </AreaChart>
        </ResponsiveContainer>
        {chartData.length < 3 && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            📊 Log more weight entries to see clearer trends
          </p>
        )}
      </CardContent>
    </Card>
  )
}

