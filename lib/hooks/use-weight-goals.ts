'use client'

import { useState, useEffect } from 'react'
import { WeightGoal, CreateWeightGoalInput, BodyMetrics, CreateBodyMetricsInput } from '@/lib/types/weight-goals'

export function useWeightGoal() {
  const [goal, setGoal] = useState<WeightGoal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGoal = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/weight-goal')
      
      if (!response.ok) {
        throw new Error('Failed to fetch weight goal')
      }

      const data = await response.json()
      setGoal(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching weight goal:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGoal()
  }, [])

  return {
    goal,
    loading,
    error,
    refresh: fetchGoal,
  }
}

export function useSaveWeightGoal() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveGoal = async (input: CreateWeightGoalInput): Promise<WeightGoal | null> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/weight-goal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save weight goal')
      }

      const goal = await response.json()
      return goal
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Error saving weight goal:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { saveGoal, loading, error }
}

export function useDeleteWeightGoal() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteGoal = async (): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/weight-goal', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete weight goal')
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Error deleting weight goal:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { deleteGoal, loading, error }
}

export function useBodyMetrics() {
  const [metrics, setMetrics] = useState<BodyMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/body-metrics')
      
      if (!response.ok) {
        throw new Error('Failed to fetch body metrics')
      }

      const data = await response.json()
      setMetrics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching body metrics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  return {
    metrics,
    loading,
    error,
    refresh: fetchMetrics,
  }
}

export function useSaveBodyMetrics() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveMetrics = async (input: CreateBodyMetricsInput): Promise<BodyMetrics | null> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/body-metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save body metrics')
      }

      const metrics = await response.json()
      return metrics
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('Error saving body metrics:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { saveMetrics, loading, error }
}


