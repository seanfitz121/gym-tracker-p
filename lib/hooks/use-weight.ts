'use client'

import { useState, useEffect } from 'react'
import { WeightLog, CreateWeightLogInput, UpdateWeightLogInput } from '@/lib/types/weight'

interface UseWeightLogsOptions {
  startDate?: string
  endDate?: string
  limit?: number
}

export function useWeightLogs(options?: UseWeightLogsOptions) {
  const [logs, setLogs] = useState<WeightLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options?.limit) params.append('limit', options.limit.toString())
      if (options?.startDate) params.append('start_date', options.startDate)
      if (options?.endDate) params.append('end_date', options.endDate)

      const response = await fetch(`/api/weight?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch weight logs')
      }

      const data = await response.json()
      setLogs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching weight logs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [options?.startDate, options?.endDate, options?.limit])

  return {
    logs,
    loading,
    error,
    refresh: fetchLogs,
  }
}

export function useWeightLog(id: string) {
  const [log, setLog] = useState<WeightLog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchLog = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/weight/${id}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch weight log')
        }

        const data = await response.json()
        setLog(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching weight log:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLog()
  }, [id])

  return { log, loading, error }
}

export function useCreateWeightLog() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createLog = async (input: CreateWeightLogInput): Promise<WeightLog | null> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/weight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create weight log')
      }

      const log = await response.json()
      return log
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Error creating weight log:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createLog, loading, error }
}

export function useUpdateWeightLog() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateLog = async (
    id: string,
    input: UpdateWeightLogInput
  ): Promise<WeightLog | null> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/weight/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update weight log')
      }

      const log = await response.json()
      return log
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Error updating weight log:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { updateLog, loading, error }
}

export function useDeleteWeightLog() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteLog = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/weight/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete weight log')
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Error deleting weight log:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { deleteLog, loading, error }
}


