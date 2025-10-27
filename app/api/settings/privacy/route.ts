import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profile')
      .select('friend_request_privacy, show_on_global_leaderboard, show_on_gym_leaderboard, friends_list_public')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({
      settings: {
        friend_requests: profile.friend_request_privacy || 'anyone',
        global_leaderboard: profile.show_on_global_leaderboard ? 'opt_in' : 'opt_out',
        gym_leaderboard: profile.show_on_gym_leaderboard ? 'opt_in' : 'opt_out',
        public_profile: profile.friends_list_public || false
      }
    })
  } catch (error) {
    console.error('Error fetching privacy settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const updates: any = {}

    if (body.friend_requests !== undefined) {
      updates.friend_request_privacy = body.friend_requests
    }

    if (body.global_leaderboard !== undefined) {
      updates.show_on_global_leaderboard = body.global_leaderboard === 'opt_in'
    }

    if (body.gym_leaderboard !== undefined) {
      updates.show_on_gym_leaderboard = body.gym_leaderboard === 'opt_in'
    }

    if (body.public_profile !== undefined) {
      updates.friends_list_public = body.public_profile
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('profile')
      .update(updates)
      .eq('id', user.id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating privacy settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

