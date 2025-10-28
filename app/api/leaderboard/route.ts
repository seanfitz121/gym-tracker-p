import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { LeaderboardType, LeaderboardRange } from '@/lib/types'

const CACHE_TTL = 300 // 5 minutes cache for leaderboards

function getIsoWeek(date: Date = new Date()): number {
  const year = date.getFullYear()
  const week = Math.ceil(((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + new Date(year, 0, 1).getDay() + 1) / 7)
  return year * 100 + week
}

function getIsoMonth(date: Date = new Date()): number {
  return date.getFullYear() * 100 + (date.getMonth() + 1)
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { searchParams } = new URL(request.url)
    const type = (searchParams.get('type') || 'friends') as LeaderboardType
    const range = (searchParams.get('range') || 'week') as LeaderboardRange
    const gymCode = searchParams.get('gym_code')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 })
    }

    const offset = (page - 1) * limit

    // Build base query
    let query = supabase
      .from('weekly_xp')
      .select('user_id, xp, workouts, volume_kg, pr_count', { count: 'exact' })

    // Apply time range filter
    if (range === 'week') {
      const currentWeek = getIsoWeek()
      query = query.eq('iso_week', currentWeek)
    } else if (range === 'month') {
      const currentMonth = getIsoMonth()
      const currentYear = new Date().getFullYear()
      // Get all weeks in current month
      query = query
        .gte('iso_week', currentMonth * 100)
        .lt('iso_week', (currentMonth + 1) * 100)
    }
    // For 'all', no time filter

    // Apply leaderboard type filter
    if (type === 'global') {
      // Only users who opted in to global leaderboard
      const { data: optedInUsers } = await supabase
        .from('profile')
        .select('id')
        .eq('show_on_global_leaderboard', true)

      const optedInIds = optedInUsers?.map(u => u.id) || []
      if (optedInIds.length === 0) {
        return NextResponse.json({
          entries: [],
          user_entry: null,
          total_participants: 0,
          page,
          total_pages: 0
        })
      }

      query = query.in('user_id', optedInIds)
    } else if (type === 'friends') {
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      // Get user's friends
      const { data: friends } = await supabase
        .from('friend')
        .select('friend_id')
        .eq('user_id', user.id)

      const friendIds = friends?.map(f => f.friend_id) || []
      friendIds.push(user.id) // Include self

      if (friendIds.length === 1) {
        // Only the user, no friends yet
        query = query.eq('user_id', user.id)
      } else {
        query = query.in('user_id', friendIds)
      }
    } else if (type === 'gym') {
      if (!gymCode) {
        return NextResponse.json({ error: 'gym_code required for gym leaderboard' }, { status: 400 })
      }

      // Get gym members who opted in
      const { data: members } = await supabase
        .from('gym_member')
        .select('user_id')
        .eq('gym_code', gymCode)
        .eq('opt_in', true)
        .eq('is_approved', true)

      const memberIds = members?.map(m => m.user_id) || []
      if (memberIds.length === 0) {
        return NextResponse.json({
          entries: [],
          user_entry: null,
          total_participants: 0,
          page,
          total_pages: 0
        })
      }

      query = query.in('user_id', memberIds).eq('gym_code', gymCode)
    }

    // Check for flagged users (exclude from top ranks)
    const { data: flaggedUsers } = await supabase
      .from('anti_cheat_flag')
      .select('user_id')
      .eq('status', 'pending')
      .gte('severity', 'medium')

    const flaggedIds = flaggedUsers?.map(f => f.user_id) || []

    // Execute query with pagination
    const { data: entries, error, count } = await query
      .order('xp', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    if (!entries || entries.length === 0) {
      return NextResponse.json({
        entries: [],
        user_entry: null,
        total_participants: 0,
        page,
        total_pages: 0
      })
    }

    // Get profiles for all users in entries
    const userIds = entries.map(e => e.user_id)
    const { data: profiles } = await supabase
      .from('profile')
      .select('id, display_name, avatar_url, account_verified_at, is_premium, premium_flair_enabled')
      .in('id', userIds)

    // Get rank_code from user_gamification
    const { data: gamificationData } = await supabase
      .from('user_gamification')
      .select('user_id, rank_code')
      .in('user_id', userIds)

    // Check for new accounts (< 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const newAccountIds = profiles
      ?.filter(p => !p.account_verified_at || new Date(p.account_verified_at) > sevenDaysAgo)
      .map(p => p.id) || []

    // Format entries with rank
    const formattedEntries = entries.map((entry, index) => {
      const profile = profiles?.find(p => p.id === entry.user_id)
      const gamification = gamificationData?.find(g => g.user_id === entry.user_id)
      return {
        user_id: entry.user_id, // Keep as user_id for backwards compatibility
        display_name: profile?.display_name,
        avatar_url: profile?.avatar_url,
        rank_code: gamification?.rank_code || null,
        rank: offset + index + 1,
        xp: entry.xp,
        workouts: entry.workouts,
        volume_kg: Number(entry.volume_kg),
        pr_count: entry.pr_count,
        is_flagged: flaggedIds.includes(entry.user_id),
        is_premium: profile?.is_premium || false,
        premium_flair_enabled: profile?.premium_flair_enabled ?? true,
        is_new_account: newAccountIds.includes(entry.user_id)
      }
    })

    // Get current user's entry if not in current page
    let userEntry = null
    if (user) {
      const userInList = formattedEntries.find(e => e.user_id === user.id)
      
      if (!userInList) {
        // Find user's rank based on the current range
        if (range === 'week') {
          const { data: userXp } = await supabase
            .from('weekly_xp')
            .select('xp, workouts, volume_kg, pr_count')
            .eq('user_id', user.id)
            .eq('iso_week', getIsoWeek())
            .single()

          if (userXp) {
            // Count how many users have more XP this week
            const { count: higherCount } = await supabase
              .from('weekly_xp')
              .select('*', { count: 'exact', head: true })
              .eq('iso_week', getIsoWeek())
              .gt('xp', userXp.xp)

            userEntry = {
              user_id: user.id,
              rank: (higherCount || 0) + 1,
              xp: userXp.xp,
              workouts: userXp.workouts,
              volume_kg: Number(userXp.volume_kg),
              pr_count: userXp.pr_count
            }
          }
        }
        // For month/all ranges, user entry calculation would need aggregation across weeks
        // Skipping for now since the main list already has the data
      } else {
        userEntry = userInList
      }
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      entries: formattedEntries,
      user_entry: userEntry,
      total_participants: count || 0,
      page,
      total_pages: totalPages
    }, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=60`
      }
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

