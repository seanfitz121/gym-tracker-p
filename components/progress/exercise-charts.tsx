'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { calculateEstimated1RM, calculateSetVolume } from '@/lib/utils/calculations'

interface ExerciseChartsProps {
  userId: string
  exerciseId: string
}

interface ChartDataPoint {
  date: string
  value: number
  label: string
}

export function ExerciseCharts({ userId, exerciseId }: ExerciseChartsProps) {
  const [loading, setLoading] = useState(true)
  const [oneRMData, setOneRMData] = useState<ChartDataPoint[]>([])
  const [topSetData, setTopSetData] = useState<ChartDataPoint[]>([])
  const [volumeData, setVolumeData] = useState<ChartDataPoint[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const supabase = createClient()

        // Get all sets for this exercise (RLS policies handle user security)
        const { data: sets, error } = await supabase
          .from('set_entry')
          .select(`
            *,
            session:workout_session(
              id,
              started_at,
              ended_at
            )
          `)
          .eq('exercise_id', exerciseId)
          .eq('is_warmup', false)
          .order('created_at', { ascending: true })
        
        if (error) {
          console.error('Error fetching sets for charts:', error)
          return
        }
        
        console.log('Sets fetched for charts:', sets?.length, sets)

        if (!sets) return

        // Group by session
        const sessionMap = new Map<string, any[]>()
        sets.forEach((set: any) => {
          const sessionId = set.session.id
          if (!sessionMap.has(sessionId)) {
            sessionMap.set(sessionId, [])
          }
          sessionMap.get(sessionId)!.push(set)
        })

        // Calculate metrics per session
        const oneRM: ChartDataPoint[] = []
        const topSet: ChartDataPoint[] = []
        const volume: ChartDataPoint[] = []

        sessionMap.forEach((sessionSets, sessionId) => {
          const sessionDate = sessionSets[0].session.started_at
          const dateLabel = format(new Date(sessionDate), 'MMM d')

          // Find highest estimated 1RM
          let maxOneRM = 0
          sessionSets.forEach((set: any) => {
            const est1RM = calculateEstimated1RM(set.weight, set.reps)
            if (est1RM > maxOneRM) maxOneRM = est1RM
          })

          oneRM.push({
            date: sessionDate,
            value: maxOneRM,
            label: dateLabel,
          })

          // Find top set (highest weight * reps)
          let maxTopSet = 0
          sessionSets.forEach((set: any) => {
            const setScore = set.weight * set.reps
            if (setScore > maxTopSet) maxTopSet = setScore
          })

          topSet.push({
            date: sessionDate,
            value: maxTopSet,
            label: dateLabel,
          })

          // Calculate total volume
          const totalVolume = sessionSets.reduce(
            (sum: number, set: any) => sum + calculateSetVolume(set.reps, set.weight),
            0
          )

          volume.push({
            date: sessionDate,
            value: totalVolume,
            label: dateLabel,
          })
        })

        setOneRMData(oneRM)
        setTopSetData(topSet)
        setVolumeData(volume)
      } catch (error) {
        console.error('Error fetching chart data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, exerciseId])

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-gray-500">
            Loading chart data...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (oneRMData.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-gray-500">
            No data available for this exercise
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="1rm" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="1rm">Estimated 1RM</TabsTrigger>
        <TabsTrigger value="topset">Top Set</TabsTrigger>
        <TabsTrigger value="volume">Volume</TabsTrigger>
      </TabsList>

      <TabsContent value="1rm">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estimated 1RM</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={oneRMData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)} kg`, 'Est. 1RM']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#3b82f6' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="topset">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Set</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={topSetData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(0)}`, 'Top Set']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="volume">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Session Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(0)} kg`, 'Volume']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#f59e0b' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

