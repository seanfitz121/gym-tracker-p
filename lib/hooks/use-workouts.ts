'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../supabase/client'
import type { WorkoutSession, SetEntry, WorkoutSessionWithSets, ActiveWorkout, BlockType } from '../types'
import { calculateEstimated1RM } from '../utils/calculations'
import { validateWorkout, createAntiCheatFlag } from '../utils/anti-cheat'

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

        // Fetch all sets
        const { data: setsData, error: setsError } = await supabase
          .from('set_entry')
          .select('*, exercise(*)')
          .eq('session_id', sessionId)
          .order('set_order')

        if (setsError) throw setsError

        // Fetch blocks for this session
        const { data: blocksData, error: blocksError } = await supabase
          .from('block')
          .select('*')
          .eq('session_id', sessionId)
          .order('position')

        if (blocksError) throw blocksError

        setSession({
          ...sessionData,
          sets: setsData || [],
          blocks: (blocksData || []).map(block => ({
            ...block,
            block_type: block.block_type as BlockType,
            rest_between_rounds: block.rest_between_rounds || 0,
          })),
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
      // Anti-cheat validation
      const validation = await validateWorkout(userId, workout)
      
      if (!validation.passed) {
        console.warn('Anti-cheat flags detected:', validation.flags)
        
        // Create flag in database for review
        await createAntiCheatFlag(
          userId,
          validation.flags.join('; '),
          validation.severity,
          {
            flags: validation.flags,
            workout_summary: {
              total_sets: workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0),
              total_blocks: workout.blocks?.length || 0,
              duration_ms: Date.now() - (typeof workout.startedAt === 'string' 
                ? new Date(workout.startedAt).getTime() 
                : workout.startedAt.getTime())
            }
          }
        )

        // For high severity, reject the workout
        if (validation.severity === 'high') {
          throw new Error('Workout flagged for suspicious activity. Please contact support if you believe this is an error.')
        }

        // For medium/low severity, allow but flag for review
      }

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

      // Create blocks first if any exist
      const blockIdMap = new Map<string, string>() // temp ID -> real ID
      if (workout.blocks && workout.blocks.length > 0) {
        for (const block of workout.blocks) {
          const { data: blockData, error: blockError } = await supabase
            .from('block')
            .insert({
              session_id: session.id,
              block_type: block.blockType,
              rounds: block.rounds,
              rest_between_rounds: block.restBetweenRounds,
              position: block.position,
            })
            .select()
            .single()

          if (blockError) {
            console.error('Block creation error:', blockError)
            throw blockError
          }

          blockIdMap.set(block.id, blockData.id)
        }
      }

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
        block_id?: string
        round_index?: number
        is_drop_step?: boolean
        drop_order?: number
      }> = []

      // Regular exercises
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

      // Block exercises
      if (workout.blocks && workout.blocks.length > 0) {
        for (const block of workout.blocks) {
          const realBlockId = blockIdMap.get(block.id)
          if (!realBlockId) continue

          for (const exercise of block.exercises) {
            for (const set of exercise.sets) {
              allSets.push({
                session_id: session.id,
                exercise_id: exercise.id,
                set_order: set.setOrder,
                reps: set.reps,
                weight: set.weight,
                weight_unit: set.weightUnit,
                rpe: set.rpe,
                is_warmup: set.isWarmup || false,
                block_id: realBlockId,
                round_index: set.roundIndex,
                is_drop_step: set.isDropStep,
                drop_order: set.dropOrder,
              })

              // Check for PRs on work sets
              if (!set.isWarmup) {
                await checkForPRs(exercise.id, set.weight, set.reps, set.weightUnit)
              }
            }
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

