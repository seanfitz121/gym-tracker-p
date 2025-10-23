'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'
import { startOfWeek, startOfMonth, startOfYear } from 'date-fns'

interface VolumeStatsCardProps {
  userId: string
}

export function VolumeStatsCard({ userId }: VolumeStatsCardProps) {
  const [stats, setStats] = useState({
    week: 0,
    month: 0,
    year: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVolumeStats = async () => {
      try {
        const supabase = createClient()
        const now = new Date()
        const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Monday
        const monthStart = startOfMonth(now)
        const yearStart = startOfYear(now)

        // Fetch all sets for the user from the start of the year
        const { data: sets, error } = await supabase
          .from('set_entry')
          .select(`
            reps,
            weight,
            weight_unit,
            is_warmup,
            created_at,
            session:workout_session!inner(user_id)
          `)
          .eq('session.user_id', userId)
          .eq('is_warmup', false)
          .gte('created_at', yearStart.toISOString())

        if (error) {
          console.error('Error fetching volume stats:', error)
          return
        }

        if (!sets) return

        // Calculate volumes
        let weekVolume = 0
        let monthVolume = 0
        let yearVolume = 0

        sets.forEach((set) => {
          const setDate = new Date(set.created_at)
          // Convert weight to kg if it's in lb
          const weightInKg = set.weight_unit === 'lb' 
            ? set.weight / 2.20462 
            : set.weight
          const volume = set.reps * weightInKg

          if (setDate >= weekStart) weekVolume += volume
          if (setDate >= monthStart) monthVolume += volume
          if (setDate >= yearStart) yearVolume += volume
        })

        setStats({
          week: Math.round(weekVolume),
          month: Math.round(monthVolume),
          year: Math.round(yearVolume),
        })
      } catch (err) {
        console.error('Error calculating volume stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchVolumeStats()
  }, [userId])

  if (loading) {
    return null
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-100 dark:border-blue-900">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Volume Moved
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              This Week
            </div>
            <div className="text-lg font-bold text-blue-600">
              {stats.week.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">kg</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              This Month
            </div>
            <div className="text-lg font-bold text-indigo-600">
              {stats.month.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">kg</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              This Year
            </div>
            <div className="text-lg font-bold text-purple-600">
              {stats.year.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">kg</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


