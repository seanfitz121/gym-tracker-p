import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get friends
    // @ts-ignore - Table exists but types not yet regenerated
    const { data: friends, error: friendsError } = await supabase
      .from('friend')
      .select('friend_id, created_at')
      .eq('user_id', user.id)

    if (friendsError) throw friendsError
    if (!friends || friends.length === 0) {
      return NextResponse.json({ friends: [] })
    }

    const friendIds = friends.map(f => f.friend_id)

    // Get profiles for friends
    const { data: profiles } = await supabase
      .from('profile')
      .select('user_id, display_name, avatar_url, rank_code')
      .in('user_id', friendIds)

    // Get gamification data for friends
    const { data: gamificationData } = await supabase
      .from('user_gamification')
      .select('user_id, total_xp, current_streak')
      .in('user_id', friendIds)

    // Get weekly XP for each friend (current week)
    const currentWeek = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
    const isoWeek = new Date().getFullYear() * 100 + Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))
    
    let weeklyXpData: any[] = []
    if (friendIds.length > 0) {
      // @ts-ignore - Table exists but types not yet regenerated
      const { data: weeklyXp } = await supabase
        .from('weekly_xp')
        .select('user_id, xp, workouts')
        .in('user_id', friendIds)
        .eq('iso_week', isoWeek)

      weeklyXpData = weeklyXp || []
    }

    // Get top PRs for all friends
    const { data: topPRs } = await supabase
      .from('personal_record')
      .select('user_id, weight, weight_unit, reps, exercise_id')
      .in('user_id', friendIds)
      .order('estimated_1rm', { ascending: false })

    // Get exercise names for top PRs
    const prExerciseIds = [...new Set(topPRs?.map(pr => pr.exercise_id).filter(Boolean) || [])]
    const { data: exercises } = await supabase
      .from('exercise')
      .select('id, name')
      .in('id', prExerciseIds)

    // Build friends with stats
    const friendsWithStats = friends.map(friend => {
      const profile = profiles?.find(p => p.user_id === friend.friend_id)
      const gamification = gamificationData?.find(g => g.user_id === friend.friend_id)
      const weeklyData = weeklyXpData.find(wx => wx.user_id === friend.friend_id)
      const topPR = topPRs?.find(pr => pr.user_id === friend.friend_id)
      const exercise = topPR ? exercises?.find(e => e.id === topPR.exercise_id) : null

      return {
        user_id: friend.friend_id,
        display_name: profile?.display_name,
        avatar_url: profile?.avatar_url,
        rank_code: profile?.rank_code,
        weekly_xp: weeklyData?.xp || 0,
        total_workouts: weeklyData?.workouts || 0,
        current_streak: gamification?.current_streak || 0,
        top_pr: topPR && exercise ? {
          exercise_name: exercise.name,
          weight: topPR.weight,
          weight_unit: topPR.weight_unit,
          reps: topPR.reps
        } : null
      }
    })

    return NextResponse.json({ friends: friendsWithStats })
  } catch (error) {
    console.error('Error fetching friends:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Remove friend
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const friend_id = searchParams.get('friend_id')

    if (!friend_id) {
      return NextResponse.json({ error: 'friend_id is required' }, { status: 400 })
    }

    // Delete both directions of the friendship
    // @ts-ignore - Table exists but types not yet regenerated
    const { error: deleteError1 } = await supabase
      .from('friend')
      .delete()
      .eq('user_id', user.id)
      .eq('friend_id', friend_id)

    // @ts-ignore - Table exists but types not yet regenerated
    const { error: deleteError2 } = await supabase
      .from('friend')
      .delete()
      .eq('user_id', friend_id)
      .eq('friend_id', user.id)

    if (deleteError1 || deleteError2) {
      throw deleteError1 || deleteError2
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing friend:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

