'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../supabase/client'
import type { UserGamification, WeeklyGoal } from '../types'
import { calculateLevel, isSameDay, getDaysBetween } from '../utils/calculations'

export function useGamification(userId?: string) {
  const [gamification, setGamification] = useState<UserGamification | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchGamification = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('user_gamification')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (error) throw error
        setGamification(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchGamification()
  }, [userId])

  const refresh = async () => {
    if (!userId) return
    
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (data) setGamification(data)
    } catch (err) {
      console.error('Error refreshing gamification:', err)
    }
  }

  return { gamification, loading, error, refresh }
}

export function useAddXP() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const addXP = async (
    userId: string,
    amount: number,
    reason?: string,
    workoutDurationMinutes?: number
  ): Promise<{ 
    newTotalXP: number
    leveledUp: boolean
    newLevel: number
    xpAwarded: number
    rankedUp: boolean
    newRank: string | null
    oldRank: string | null
  }> => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Get current gamification data
      const { data: current } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (!current) {
        throw new Error('Gamification data not found')
      }

      // Anti-cheat measures
      const now = new Date()
      let actualXPAwarded = amount

      // 1. Check workout cooldown (30 minutes between workouts)
      if (reason === 'Workout completed' && current.last_workout_date) {
        const lastWorkout = new Date(current.last_workout_date)
        const minutesSinceLastWorkout = (now.getTime() - lastWorkout.getTime()) / (1000 * 60)
        
        if (minutesSinceLastWorkout < 30) {
          console.log('Workout cooldown active - no XP awarded')
          return {
            newTotalXP: current.total_xp,
            leveledUp: false,
            newLevel: current.level,
            xpAwarded: 0,
            rankedUp: false,
            newRank: null,
            oldRank: null
          }
        }
      }

      // 2. Check minimum workout duration (5 minutes)
      if (reason === 'Workout completed' && workoutDurationMinutes && workoutDurationMinutes < 5) {
        console.log('Workout too short - no XP awarded')
        return {
          newTotalXP: current.total_xp,
          leveledUp: false,
          newLevel: current.level,
          xpAwarded: 0,
          rankedUp: false,
          newRank: null,
          oldRank: null
        }
      }

      // 3. Daily XP cap (500 XP per day)
      const DAILY_XP_CAP = 500
      const lastWorkoutDate = current.last_workout_date ? new Date(current.last_workout_date) : null
      const isNewDay = !lastWorkoutDate || !isSameDay(lastWorkoutDate, now)
      
      let dailyXP = isNewDay ? 0 : (current.daily_xp_earned || 0)
      
      if (dailyXP + actualXPAwarded > DAILY_XP_CAP) {
        actualXPAwarded = Math.max(0, DAILY_XP_CAP - dailyXP)
        console.log(`Daily XP cap reached - awarded ${actualXPAwarded} XP instead of ${amount}`)
      }

      if (actualXPAwarded === 0) {
        return {
          newTotalXP: current.total_xp,
          leveledUp: false,
          newLevel: current.level,
          xpAwarded: 0,
          rankedUp: false,
          newRank: null,
          oldRank: null
        }
      }

      const oldLevel = current.level
      const oldRankCode = current.rank_code
      const newTotalXP = current.total_xp + actualXPAwarded
      const newLevel = calculateLevel(newTotalXP)
      const leveledUp = newLevel > oldLevel

      // Compute new rank based on new total XP
      const scaleCode = current.rank_scale_code || 'free'
      
      // Check if user is admin
      const { data: adminUser } = await supabase
        .from('admin_user')
        .select('*')
        .eq('user_id', userId)
        .single()

      let newRankCode = oldRankCode
      let rankedUp = false

      if (!adminUser) {
        // Get all ranks for scale, ordered by min_xp descending
        const { data: allRanks } = await supabase
          .from('rank_definition')
          .select('*')
          .eq('scale_code', scaleCode)
          .order('min_xp', { ascending: false })

        if (allRanks && allRanks.length > 0) {
          // Find the highest rank where min_xp <= newTotalXP
          const newRankDef = allRanks.find(rank => newTotalXP >= rank.min_xp)
          
          if (newRankDef && newRankDef.code !== oldRankCode) {
            newRankCode = newRankDef.code
            rankedUp = true
          }
        }
      }

      // Update gamification data
      await supabase
        .from('user_gamification')
        .update({
          total_xp: newTotalXP,
          level: newLevel,
          daily_xp_earned: isNewDay ? actualXPAwarded : dailyXP + actualXPAwarded,
          rank_code: newRankCode,
        })
        .eq('user_id', userId)

      return { 
        newTotalXP, 
        leveledUp, 
        newLevel, 
        xpAwarded: actualXPAwarded,
        rankedUp,
        newRank: newRankCode,
        oldRank: oldRankCode
      }
    } catch (err) {
      setError(err as Error)
      return { 
        newTotalXP: 0, 
        leveledUp: false, 
        newLevel: 1, 
        xpAwarded: 0,
        rankedUp: false,
        newRank: null,
        oldRank: null
      }
    } finally {
      setLoading(false)
    }
  }

  return { addXP, loading, error }
}

export function useUpdateStreak() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateStreak = async (
    userId: string
  ): Promise<{ currentStreak: number; streakIncreased: boolean }> => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Get current gamification data
      const { data: current } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (!current) {
        throw new Error('Gamification data not found')
      }

      const now = new Date()
      const lastWorkoutDate = current.last_workout_date
        ? new Date(current.last_workout_date)
        : null

      // If already worked out today, no streak update needed
      if (lastWorkoutDate && isSameDay(lastWorkoutDate, now)) {
        return { currentStreak: current.current_streak, streakIncreased: false }
      }

      let newStreak = current.current_streak
      let streakIncreased = false

      if (!lastWorkoutDate) {
        // First workout ever
        newStreak = 1
        streakIncreased = true
      } else {
        const daysSinceLastWorkout = getDaysBetween(lastWorkoutDate, now)

        if (daysSinceLastWorkout === 1) {
          // Consecutive day
          newStreak = current.current_streak + 1
          streakIncreased = true
        } else if (daysSinceLastWorkout === 2 && !current.forgiveness_used_at) {
          // Use forgiveness pass
          newStreak = current.current_streak + 1
          streakIncreased = true
          
          await supabase
            .from('user_gamification')
            .update({
              forgiveness_used_at: now.toISOString(),
            })
            .eq('user_id', userId)
        } else {
          // Streak broken
          newStreak = 1
        }
      }

      // Reset forgiveness if 30 days have passed
      let forgivenessResetAt = current.forgiveness_used_at
      if (forgivenessResetAt) {
        const daysSinceForgiveness = getDaysBetween(new Date(forgivenessResetAt), now)
        if (daysSinceForgiveness >= 30) {
          forgivenessResetAt = null
        }
      }

      // Update gamification data
      await supabase
        .from('user_gamification')
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(current.longest_streak, newStreak),
          last_workout_date: now.toISOString(),
          forgiveness_used_at: forgivenessResetAt,
        })
        .eq('user_id', userId)

      return { currentStreak: newStreak, streakIncreased }
    } catch (err) {
      setError(err as Error)
      return { currentStreak: 0, streakIncreased: false }
    } finally {
      setLoading(false)
    }
  }

  return { updateStreak, loading, error }
}

export function useAddBadge() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const addBadge = async (userId: string, badgeId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Get current badges
      const { data: current } = await supabase
        .from('user_gamification')
        .select('badges')
        .eq('user_id', userId)
        .single()

      if (!current) {
        throw new Error('Gamification data not found')
      }

      // Check if badge already exists
      const currentBadges = current.badges || []
      if (currentBadges.includes(badgeId)) {
        return false
      }

      // Add new badge
      await supabase
        .from('user_gamification')
        .update({
          badges: [...currentBadges, badgeId],
        })
        .eq('user_id', userId)

      return true
    } catch (err) {
      setError(err as Error)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { addBadge, loading, error }
}

export function useUpdateWeeklyGoal() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateWeeklyGoal = async (
    userId: string,
    goal: WeeklyGoal
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      await supabase
        .from('user_gamification')
        .update({
          weekly_goal: goal as any,
        })
        .eq('user_id', userId)

      return true
    } catch (err) {
      setError(err as Error)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { updateWeeklyGoal, loading, error }
}

