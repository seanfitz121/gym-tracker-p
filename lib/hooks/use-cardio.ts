// Hooks for cardio session data

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CardioSession, CardioSessionWithIntervals, CardioStats, CardioType } from '@/lib/types/cardio'

export function useCardioSessions(options?: {
  cardioType?: CardioType
  limit?: number
  startDate?: string
  endDate?: string
}) {
  const [sessions, setSessions] = useState<CardioSessionWithIntervals[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (options?.cardioType) params.append('type', options.cardioType)
        if (options?.limit) params.append('limit', options.limit.toString())
        if (options?.startDate) params.append('start_date', options.startDate)
        if (options?.endDate) params.append('end_date', options.endDate)

        const response = await fetch(`/api/cardio/session?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch cardio sessions')
        }

        const data = await response.json()
        setSessions(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch sessions')
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [options?.cardioType, options?.limit, options?.startDate, options?.endDate])

  return { sessions, loading, error, refetch: () => {
    const fetchSessions = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (options?.cardioType) params.append('type', options.cardioType)
        if (options?.limit) params.append('limit', options.limit.toString())
        if (options?.startDate) params.append('start_date', options.startDate)
        if (options?.endDate) params.append('end_date', options.endDate)

        const response = await fetch(`/api/cardio/session?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch cardio sessions')
        }

        const data = await response.json()
        setSessions(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch sessions')
      } finally {
        setLoading(false)
      }
    }
    fetchSessions()
  } }
}

export function useCardioSession(sessionId: string | null) {
  const [session, setSession] = useState<CardioSessionWithIntervals | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setSession(null)
      setLoading(false)
      return
    }

    const fetchSession = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/cardio/session/${sessionId}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Session not found')
            return
          }
          throw new Error('Failed to fetch cardio session')
        }

        const data = await response.json()
        setSession(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch session')
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [sessionId])

  return { session, loading, error }
}

export function useCardioStats(options?: {
  cardioType?: CardioType
  period?: number // days
}) {
  const [stats, setStats] = useState<CardioStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (options?.cardioType) params.append('type', options.cardioType)
        if (options?.period) params.append('period', options.period.toString())

        const response = await fetch(`/api/cardio/stats?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch cardio stats')
        }

        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [options?.cardioType, options?.period])

  return { stats, loading, error }
}

export function useCreateCardioSession() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createSession = async (sessionData: any) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/cardio/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create cardio session')
      }

      const data = await response.json()
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create session'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createSession, loading, error }
}

export function useUpdateCardioSession() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateSession = async (sessionId: string, sessionData: any) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/cardio/session/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update cardio session')
      }

      const data = await response.json()
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update session'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { updateSession, loading, error }
}

export function useDeleteCardioSession() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteSession = async (sessionId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/cardio/session/${sessionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete cardio session')
      }

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete session'
      setError(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { deleteSession, loading, error }
}

