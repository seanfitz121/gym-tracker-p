'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../supabase/client'
import type { PersonalRecord } from '../types'
import { calculateEstimated1RM, convertWeight } from '../utils/calculations'

export function usePersonalRecords(userId?: string, exerciseId?: string) {
  const [records, setRecords] = useState<PersonalRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchRecords = async () => {
      try {
        const supabase = createClient()
        let query = supabase
          .from('personal_record')
          .select('*')
          .eq('user_id', userId)
          .order('achieved_at', { ascending: false })

        if (exerciseId) {
          query = query.eq('exercise_id', exerciseId)
        }

        const { data, error } = await query

        if (error) throw error
        setRecords(data || [])
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [userId, exerciseId])

  return { records, loading, error }
}

export function useCheckAndCreatePR() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const checkAndCreatePR = async (
    userId: string,
    exerciseId: string,
    weight: number,
    reps: number,
    weightUnit: 'kg' | 'lb'
  ): Promise<{ isNewPR: boolean; pr?: PersonalRecord }> => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Calculate estimated 1RM
      const estimated1RM = calculateEstimated1RM(weight, reps)

      // Get current PR for this exercise
      const { data: currentPR } = await supabase
        .from('personal_record')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .order('estimated_1rm', { ascending: false })
        .limit(1)
        .single()

      // Convert current PR to same unit for comparison
      let currentPR1RM = 0
      if (currentPR) {
        const prWeight = currentPR.weight_unit === weightUnit
          ? currentPR.weight
          : convertWeight(currentPR.weight, currentPR.weight_unit, weightUnit)
        currentPR1RM = calculateEstimated1RM(prWeight, currentPR.reps)
      }

      // Check if this is a new PR
      if (estimated1RM > currentPR1RM) {
        const { data: newPR, error: prError } = await supabase
          .from('personal_record')
          .insert({
            user_id: userId,
            exercise_id: exerciseId,
            weight,
            reps,
            weight_unit: weightUnit,
            estimated_1rm: estimated1RM,
            achieved_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (prError) throw prError

        return { isNewPR: true, pr: newPR }
      }

      return { isNewPR: false }
    } catch (err) {
      setError(err as Error)
      return { isNewPR: false }
    } finally {
      setLoading(false)
    }
  }

  return { checkAndCreatePR, loading, error }
}

export function useTopPRByExercise(userId?: string) {
  const [prs, setPRs] = useState<Record<string, PersonalRecord>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchTopPRs = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('personal_record')
          .select('*')
          .eq('user_id', userId)
          .order('estimated_1rm', { ascending: false })

        if (error) throw error

        // Group by exercise and keep only the top PR for each
        const grouped: Record<string, PersonalRecord> = {}
        data?.forEach((pr) => {
          if (!grouped[pr.exercise_id] || pr.estimated_1rm! > grouped[pr.exercise_id].estimated_1rm!) {
            grouped[pr.exercise_id] = pr
          }
        })

        setPRs(grouped)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopPRs()
  }, [userId])

  return { prs, loading, error }
}


