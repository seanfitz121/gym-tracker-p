'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../supabase/client'
import type { WorkoutSession, SetEntry, WorkoutSessionWithSets, ActiveWorkout } from '../types'
import { calculateEstimated1RM } from '../utils/calculations'

export function useWorkoutSessions(userId?: string, limit?: number) {
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchSessions = async () => {
      try {
        const supabase = createClient()
        let query = supabase
          .from('workout_session')
          .select('*')
          .eq('user_id', userId)
          .order('started_at', { ascending: false })

        if (limit) {
          query = query.limit(limit)
        }

        const { data, error } = await query

        if (error) throw error
        setSessions(data || [])
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [userId, limit])

  return { sessions, loading, error, refresh: () => {} }
}

export function useWorkoutSession(sessionId?: string) {
  const [session, setSession] = useState<WorkoutSessionWithSets | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }

    const fetchSession = async () => {
      try {
        const supabase = createClient()
        const { data: sessionData, error: sessionError } = await supabase
          .from('workout_session')
          .select('*')
          .eq('id', sessionId)
          .single()

        if (sessionError) throw sessionError

        const { data: setsData, error: setsError } = await supabase
          .from('set_entry')
          .select('*, exercise(*)')
          .eq('session_id', sessionId)
          .order('set_order')

        if (setsError) throw setsError

        setSession({
          ...sessionData,
          sets: setsData || [],
        })
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [sessionId])

  return { session, loading, error }
}

export function useSaveWorkout() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const saveWorkout = async (
    userId: string,
    workout: ActiveWorkout,
    checkForPRs: (exerciseId: string, weight: number, reps: number, weightUnit: 'kg' | 'lb') => Promise<void>
  ): Promise<string | null> => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Create workout session
      // Convert startedAt to Date if it's a string (from localStorage rehydration)
      const startedAt = typeof workout.startedAt === 'string' 
        ? new Date(workout.startedAt) 
        : workout.startedAt
      
      const { data: session, error: sessionError } = await supabase
        .from('workout_session')
        .insert({
          user_id: userId,
          started_at: startedAt.toISOString(),
          ended_at: new Date().toISOString(),
          title: workout.title,
          notes: workout.notes,
        })
        .select()
        .single()

      if (sessionError) {
        console.error('Session creation error:', sessionError)
        throw sessionError
      }

      console.log('Session created:', session)

      // Create all sets
      const allSets: Array<{
        session_id: string
        exercise_id: string
        set_order: number
        reps: number
        weight: number
        weight_unit: 'kg' | 'lb'
        rpe?: number
        is_warmup: boolean
      }> = []

      for (const exercise of workout.exercises) {
        for (const set of exercise.sets) {
          allSets.push({
            session_id: session.id,
            exercise_id: exercise.id,
            set_order: set.setOrder,
            reps: set.reps,
            weight: set.weight,
            weight_unit: set.weightUnit,
            rpe: set.rpe,
            is_warmup: set.isWarmup,
          })

          // Check for PRs on work sets
          if (!set.isWarmup) {
            await checkForPRs(exercise.id, set.weight, set.reps, set.weightUnit)
          }
        }
      }

      if (allSets.length > 0) {
        console.log('Inserting sets:', allSets.length)
        const { error: setsError } = await supabase
          .from('set_entry')
          .insert(allSets)

        if (setsError) {
          console.error('Sets insertion error:', setsError)
          throw setsError
        }
      }

      console.log('Workout saved successfully:', session.id)
      return session.id
    } catch (err) {
      console.error('saveWorkout error:', err)
      setError(err as Error)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { saveWorkout, loading, error }
}

export function useDeleteWorkoutSession() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteSession = async (sessionId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('workout_session')
        .delete()
        .eq('id', sessionId)

      if (error) throw error
      return true
    } catch (err) {
      setError(err as Error)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { deleteSession, loading, error }
}

