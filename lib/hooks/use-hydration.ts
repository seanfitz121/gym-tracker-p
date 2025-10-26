'use client'

import { useState, useEffect } from 'react'
import { HydrationLog, HydrationStats } from '@/lib/types/hydration'
import { format } from 'date-fns'

export function useHydrationLogs(startDate?: string, endDate?: string) {
  const [logs, setLogs] = useState<HydrationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)

      const response = await fetch(`/api/hydration?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch hydration logs')
      }

      const data = await response.json()
      setLogs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching hydration logs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [startDate, endDate])

  return {
    logs,
    loading,
    error,
    refresh: fetchLogs,
  }
}

export function useHydrationStats(goalMl: number = 3000) {
  const [stats, setStats] = useState<HydrationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/hydration/stats?goal_ml=${goalMl}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch hydration stats')
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching hydration stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [goalMl])

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  }
}

export function useAddHydration() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addHydration = async (amount_ml: number): Promise<HydrationLog | null> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/hydration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount_ml }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add hydration')
      }

      const log = await response.json()
      return log
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Error adding hydration:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { addHydration, loading, error }
}

export function useDeleteHydrationLog() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteLog = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/hydration/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete hydration log')
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Error deleting hydration log:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { deleteLog, loading, error }
}


