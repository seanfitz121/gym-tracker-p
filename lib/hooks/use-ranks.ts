'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../supabase/client'
import type { UserRank, RankDefinition, RankProgress } from '../types'

/**
 * Get the user's current rank with admin override support
 */
export function useUserRank(userId?: string) {
  const [rank, setRank] = useState<UserRank | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchUserRank = async () => {
      try {
        const supabase = createClient()

        // Check if user is admin
        const { data: adminUser, error: adminError } = await supabase
          .from('admin_user')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle() // Use maybeSingle() instead of single()

        // Ignore "no row found" errors
        if (adminError && adminError.code !== 'PGRST116') {
          console.error('Error checking admin status:', adminError)
        }

        if (adminUser) {
          setRank({
            code: 'ADMIN',
            name: 'Admin',
            color: 'red',
            icon: 'shield',
            scale: 'admin',
            isAdmin: true,
          })
          setLoading(false)
          return
        }

        // Get user's current gamification data
        const { data: gamification } = await supabase
          .from('user_gamification')
          .select('total_xp, rank_code, rank_scale_code')
          .eq('user_id', userId)
          .single()

        if (!gamification) {
          throw new Error('Gamification data not found')
        }

        // Get rank definition
        const { data: rankDef } = await supabase
          .from('rank_definition')
          .select('*')
          .eq('scale_code', gamification.rank_scale_code || 'free')
          .eq('code', gamification.rank_code || 'NOOB')
          .single()

        if (rankDef) {
          setRank({
            code: rankDef.code,
            name: rankDef.name,
            color: rankDef.color,
            icon: rankDef.icon,
            scale: rankDef.scale_code,
            isAdmin: false,
          })
        }
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserRank()
  }, [userId])

  return { rank, loading, error }
}

/**
 * Get rank progress (current rank + progress to next)
 */
export function useRankProgress(userId?: string) {
  const [progress, setProgress] = useState<RankProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchRankProgress = async () => {
      try {
        const supabase = createClient()

        // Check if admin
        const { data: adminUser } = await supabase
          .from('admin_user')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (adminUser) {
          // Admin has no next rank
          setProgress({
            currentRank: {
              code: 'ADMIN',
              name: 'Admin',
              color: 'red',
              icon: 'shield',
              scale: 'admin',
              isAdmin: true,
            },
            nextRank: null,
            progress: 1,
            xpToNext: 0,
            totalXp: 0,
          })
          setLoading(false)
          return
        }

        // Get gamification data
        const { data: gamification } = await supabase
          .from('user_gamification')
          .select('total_xp, rank_code, rank_scale_code')
          .eq('user_id', userId)
          .single()

        if (!gamification) {
          throw new Error('Gamification data not found')
        }

        const totalXp = gamification.total_xp
        const scaleCode = gamification.rank_scale_code || 'free'

        // Get all ranks for scale
        const { data: allRanks } = await supabase
          .from('rank_definition')
          .select('*')
          .eq('scale_code', scaleCode)
          .order('min_xp', { ascending: true })

        if (!allRanks || allRanks.length === 0) {
          throw new Error('No ranks found')
        }

        // Find current rank (highest rank where min_xp <= totalXp)
        let currentRankDef: RankDefinition | null = null
        let nextRankDef: RankDefinition | null = null

        for (let i = allRanks.length - 1; i >= 0; i--) {
          if (totalXp >= allRanks[i].min_xp) {
            currentRankDef = allRanks[i]
            nextRankDef = allRanks[i + 1] || null
            break
          }
        }

        if (!currentRankDef) {
          // Fallback to first rank
          currentRankDef = allRanks[0]
          nextRankDef = allRanks[1] || null
        }

        // Calculate progress
        let progressValue = 1 // default to full if at max rank
        let xpToNext = 0

        if (nextRankDef) {
          const xpInCurrentRank = totalXp - currentRankDef.min_xp
          const xpNeededForNext = nextRankDef.min_xp - currentRankDef.min_xp
          progressValue = xpNeededForNext > 0 ? xpInCurrentRank / xpNeededForNext : 1
          xpToNext = nextRankDef.min_xp - totalXp
        }

        setProgress({
          currentRank: {
            code: currentRankDef.code,
            name: currentRankDef.name,
            color: currentRankDef.color,
            icon: currentRankDef.icon,
            scale: currentRankDef.scale_code,
            isAdmin: false,
          },
          nextRank: nextRankDef,
          progress: Math.max(0, Math.min(1, progressValue)),
          xpToNext: Math.max(0, xpToNext),
          totalXp,
        })
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchRankProgress()
  }, [userId])

  return { progress, loading, error }
}

/**
 * Recompute and update user's rank based on current XP
 * Returns the new rank and whether a rank up occurred
 */
export function useRecomputeRank() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const recomputeRank = async (
    userId: string
  ): Promise<{ 
    newRank: UserRank | null
    oldRank: UserRank | null
    rankedUp: boolean 
  }> => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Check if admin
      const { data: adminUser } = await supabase
        .from('admin_user')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (adminUser) {
        // Admins don't rank up
        const adminRank: UserRank = {
          code: 'ADMIN',
          name: 'Admin',
          color: 'red',
          icon: 'shield',
          scale: 'admin',
          isAdmin: true,
        }
        return { newRank: adminRank, oldRank: adminRank, rankedUp: false }
      }

      // Get current gamification data
      const { data: gamification } = await supabase
        .from('user_gamification')
        .select('total_xp, rank_code, rank_scale_code')
        .eq('user_id', userId)
        .single()

      if (!gamification) {
        throw new Error('Gamification data not found')
      }

      const totalXp = gamification.total_xp
      const scaleCode = gamification.rank_scale_code || 'free'
      const oldRankCode = gamification.rank_code

      // Get all ranks for scale, ordered by min_xp descending
      const { data: allRanks } = await supabase
        .from('rank_definition')
        .select('*')
        .eq('scale_code', scaleCode)
        .order('min_xp', { ascending: false })

      if (!allRanks || allRanks.length === 0) {
        throw new Error('No ranks found')
      }

      // Find the highest rank where min_xp <= totalXp
      const newRankDef = allRanks.find(rank => totalXp >= rank.min_xp) || allRanks[allRanks.length - 1]

      // Update rank if changed
      if (newRankDef.code !== oldRankCode) {
        await supabase
          .from('user_gamification')
          .update({ rank_code: newRankDef.code })
          .eq('user_id', userId)

        const newRank: UserRank = {
          code: newRankDef.code,
          name: newRankDef.name,
          color: newRankDef.color,
          icon: newRankDef.icon,
          scale: newRankDef.scale_code,
          isAdmin: false,
        }

        // Get old rank info if it exists
        let oldRank: UserRank | null = null
        if (oldRankCode) {
          const { data: oldRankDef } = await supabase
            .from('rank_definition')
            .select('*')
            .eq('scale_code', scaleCode)
            .eq('code', oldRankCode)
            .single()

          if (oldRankDef) {
            oldRank = {
              code: oldRankDef.code,
              name: oldRankDef.name,
              color: oldRankDef.color,
              icon: oldRankDef.icon,
              scale: oldRankDef.scale_code,
              isAdmin: false,
            }
          }
        }

        return { newRank, oldRank, rankedUp: true }
      }

      // No rank change
      const currentRank: UserRank = {
        code: newRankDef.code,
        name: newRankDef.name,
        color: newRankDef.color,
        icon: newRankDef.icon,
        scale: newRankDef.scale_code,
        isAdmin: false,
      }

      return { newRank: currentRank, oldRank: currentRank, rankedUp: false }
    } catch (err) {
      setError(err as Error)
      return { newRank: null, oldRank: null, rankedUp: false }
    } finally {
      setLoading(false)
    }
  }

  return { recomputeRank, loading, error }
}

/**
 * Get all rank definitions for a scale
 */
export function useRankDefinitions(scaleCode: string = 'free') {
  const [ranks, setRanks] = useState<RankDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchRanks = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('rank_definition')
          .select('*')
          .eq('scale_code', scaleCode)
          .order('sort_order', { ascending: true })

        if (error) throw error
        setRanks(data || [])
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchRanks()
  }, [scaleCode])

  return { ranks, loading, error }
}


