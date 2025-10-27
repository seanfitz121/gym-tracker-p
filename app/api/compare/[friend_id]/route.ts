import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { friend_id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const friendId = params.friend_id
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')

    if (![7, 30, 90].includes(days)) {
      return NextResponse.json({ error: 'days must be 7, 30, or 90' }, { status: 400 })
    }

    // Verify friendship
    const { data: friendship } = await supabase
      .from('friend')
      .select('*')
      .eq('user_id', user.id)
      .eq('friend_id', friendId)
      .single()

    if (!friendship) {
      return NextResponse.json({ error: 'Not friends with this user' }, { status: 403 })
    }

    // Get date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get both users' profiles
    const { data: profiles } = await supabase
      .from('profile')
      .select('user_id, display_name, avatar_url, rank_code')
      .in('user_id', [user.id, friendId])

    const userProfile = profiles?.find(p => p.user_id === user.id)
    const friendProfile = profiles?.find(p => p.user_id === friendId)

    // Get gamification stats
    const { data: gamificationStats } = await supabase
      .from('user_gamification')
      .select('user_id, total_xp, current_streak, total_workouts')
      .in('user_id', [user.id, friendId])

    const userGamification = gamificationStats?.find(g => g.user_id === user.id)
    const friendGamification = gamificationStats?.find(g => g.user_id === friendId)

    // Get workouts in date range for both users
    const { data: workouts } = await supabase
      .from('workout_session')
      .select(`
        id,
        user_id,
        created_at,
        total_volume_kg,
        set_entries:set_entry(count)
      `)
      .in('user_id', [user.id, friendId])
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true })

    // Get PR counts in date range
    const { count: userPRCount } = await supabase
      .from('personal_record')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('achieved_at', startDate.toISOString())

    const { count: friendPRCount } = await supabase
      .from('personal_record')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', friendId)
      .gte('achieved_at', startDate.toISOString())

    // Get total PRs
    const { count: userTotalPRs } = await supabase
      .from('personal_record')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { count: friendTotalPRs } = await supabase
      .from('personal_record')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', friendId)

    // Get weekly XP data for timeline
    const weeksAgo = Math.ceil(days / 7)
    const { data: weeklyXp } = await supabase
      .from('weekly_xp')
      .select('user_id, iso_week, xp, workouts, volume_kg')
      .in('user_id', [user.id, friendId])
      .order('iso_week', { ascending: true })
      .limit(weeksAgo * 2)

    // Calculate aggregate stats
    const userWorkouts = workouts?.filter(w => w.user_id === user.id) || []
    const friendWorkouts = workouts?.filter(w => w.user_id === friendId) || []

    const userTotalVolume = userWorkouts.reduce((sum, w) => sum + (Number(w.total_volume_kg) || 0), 0)
    const friendTotalVolume = friendWorkouts.reduce((sum, w) => sum + (Number(w.total_volume_kg) || 0), 0)

    const userTotalSets = userWorkouts.reduce((sum, w) => sum + (w.set_entries?.count || 0), 0)
    const friendTotalSets = friendWorkouts.reduce((sum, w) => sum + (w.set_entries?.count || 0), 0)

    // Calculate weekly XP in period
    const userWeeklyXp = weeklyXp?.filter(wx => wx.user_id === user.id) || []
    const friendWeeklyXp = weeklyXp?.filter(wx => wx.user_id === friendId) || []

    const userXpInPeriod = userWeeklyXp.reduce((sum, wx) => sum + wx.xp, 0)
    const friendXpInPeriod = friendWeeklyXp.reduce((sum, wx) => sum + wx.xp, 0)

    // Format timeline data for charts
    const timeline = {
      user: userWeeklyXp.map(wx => ({
        week: wx.iso_week,
        xp: wx.xp,
        workouts: wx.workouts,
        volume_kg: Number(wx.volume_kg)
      })),
      friend: friendWeeklyXp.map(wx => ({
        week: wx.iso_week,
        xp: wx.xp,
        workouts: wx.workouts,
        volume_kg: Number(wx.volume_kg)
      }))
    }

    return NextResponse.json({
      user: {
        id: user.id,
        display_name: userProfile?.display_name,
        avatar_url: userProfile?.avatar_url,
        rank_code: userProfile?.rank_code,
        total_xp: userGamification?.total_xp || 0,
        current_streak: userGamification?.current_streak || 0,
        total_workouts: userGamification?.total_workouts || 0,
        total_prs: userTotalPRs || 0,
        period_stats: {
          xp: userXpInPeriod,
          workouts: userWorkouts.length,
          volume_kg: Math.round(userTotalVolume),
          total_sets: userTotalSets,
          prs: userPRCount || 0
        }
      },
      friend: {
        id: friendId,
        display_name: friendProfile?.display_name,
        avatar_url: friendProfile?.avatar_url,
        rank_code: friendProfile?.rank_code,
        total_xp: friendGamification?.total_xp || 0,
        current_streak: friendGamification?.current_streak || 0,
        total_workouts: friendGamification?.total_workouts || 0,
        total_prs: friendTotalPRs || 0,
        period_stats: {
          xp: friendXpInPeriod,
          workouts: friendWorkouts.length,
          volume_kg: Math.round(friendTotalVolume),
          total_sets: friendTotalSets,
          prs: friendPRCount || 0
        }
      },
      timeline,
      period_days: days
    })
  } catch (error) {
    console.error('Error comparing with friend:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

