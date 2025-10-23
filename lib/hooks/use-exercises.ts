'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../supabase/client'
import type { Exercise } from '../types'
import { DEFAULT_EXERCISES } from '../constants/exercises'

export function useExercises(userId?: string) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchExercises = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('exercise')
          .select('*')
          .eq('user_id', userId)
          .order('name')

        if (error) throw error
        setExercises(data || [])
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchExercises()
  }, [userId])

  return { exercises, loading, error }
}

export function useCreateExercise() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createExercise = async (
    userId: string,
    name: string,
    bodyPart?: string
  ): Promise<Exercise | null> => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('exercise')
        .insert({
          user_id: userId,
          name,
          body_part: bodyPart,
          is_custom: true,
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      setError(err as Error)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createExercise, loading, error }
}

export function useGetOrCreateExercise() {
  const { createExercise } = useCreateExercise()

  const getOrCreate = async (
    userId: string,
    name: string,
    bodyPart?: string
  ): Promise<Exercise | null> => {
    const supabase = createClient()

    // Check if exercise already exists for this user
    const { data: existing } = await supabase
      .from('exercise')
      .select('*')
      .eq('user_id', userId)
      .eq('name', name)
      .single()

    if (existing) return existing

    // Create new exercise
    return await createExercise(userId, name, bodyPart)
  }

  return { getOrCreate }
}

// Get combined list of default exercises and user's custom exercises
export function useExerciseLibrary(userId?: string) {
  const { exercises: customExercises, loading } = useExercises(userId)

  // Combine default exercises with custom ones
  const allExercises = [
    ...DEFAULT_EXERCISES.map((ex) => ({
      name: ex.name,
      bodyPart: ex.bodyPart,
      isCustom: false,
    })),
    ...customExercises.map((ex) => ({
      name: ex.name,
      bodyPart: ex.body_part || undefined,
      isCustom: true,
    })),
  ]

  return { exercises: allExercises, loading }
}


