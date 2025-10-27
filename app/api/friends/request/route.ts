import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SendFriendRequestPayload } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: SendFriendRequestPayload = await request.json()
    const { to_user_id } = body

    if (!to_user_id) {
      return NextResponse.json({ error: 'to_user_id is required' }, { status: 400 })
    }

    if (to_user_id === user.id) {
      return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 })
    }

    // Check if users are already friends
    const { data: existingFriend } = await supabase
      .from('friend')
      .select('*')
      .eq('user_id', user.id)
      .eq('friend_id', to_user_id)
      .single()

    if (existingFriend) {
      return NextResponse.json({ error: 'Already friends' }, { status: 400 })
    }

    // Check target user's privacy settings
    const { data: targetProfile } = await supabase
      .from('profile')
      .select('friend_request_privacy')
      .eq('id', to_user_id)
      .single()

    if (!targetProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check privacy settings
    if (targetProfile.friend_request_privacy === 'nobody') {
      return NextResponse.json({ error: 'This user is not accepting friend requests' }, { status: 403 })
    }

    if (targetProfile.friend_request_privacy === 'friends_of_friends') {
      // Check if they have mutual friends
      // First get the target user's friends
      const { data: targetFriends } = await supabase
        .from('friend')
        .select('friend_id')
        .eq('user_id', to_user_id)

      const targetFriendIds = targetFriends?.map(f => f.friend_id) || []

      // Then check if current user is friends with any of them
      const { data: mutualFriends } = await supabase
        .from('friend')
        .select('friend_id')
        .eq('user_id', user.id)
        .in('friend_id', targetFriendIds)

      if (!mutualFriends || mutualFriends.length === 0) {
        return NextResponse.json({ error: 'You must have mutual friends to send a request' }, { status: 403 })
      }
    }

    // Create friend request
    const { data: friendRequest, error: createError } = await supabase
      .from('friend_request')
      .insert({
        from_user: user.id,
        to_user: to_user_id,
        status: 'pending'
      })
      .select()
      .single()

    if (createError) {
      // Check for duplicate request
      if (createError.code === '23505') {
        return NextResponse.json({ error: 'Friend request already sent' }, { status: 400 })
      }
      throw createError
    }

    return NextResponse.json({ success: true, request: friendRequest })
  } catch (error) {
    console.error('Error sending friend request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get incoming and outgoing friend requests
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'incoming' // incoming, outgoing, all

    let query = supabase
      .from('friend_request')
      .select('*')
      .eq('status', 'pending')

    if (type === 'incoming') {
      query = query.eq('to_user', user.id)
    } else if (type === 'outgoing') {
      query = query.eq('from_user', user.id)
    } else {
      query = query.or(`to_user.eq.${user.id},from_user.eq.${user.id}`)
    }

    const { data: requests, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    // Fetch profile data for all users in requests
    if (requests && requests.length > 0) {
      const userIds = [...new Set(requests.flatMap(r => [r.from_user, r.to_user]))]
      const { data: profiles } = await supabase
        .from('profile')
        .select('id, display_name, avatar_url')
        .in('id', userIds)

      // Get rank_code from user_gamification
      const { data: gamificationData } = await supabase
        .from('user_gamification')
        .select('user_id, rank_code')
        .in('user_id', userIds)

      // Attach profiles to requests
      const requestsWithProfiles = requests.map(req => {
        const fromProfile = profiles?.find(p => p.id === req.from_user)
        const toProfile = profiles?.find(p => p.id === req.to_user)
        const fromGamification = gamificationData?.find(g => g.user_id === req.from_user)
        const toGamification = gamificationData?.find(g => g.user_id === req.to_user)
        
        return {
          ...req,
          from_profile: fromProfile ? { 
            ...fromProfile, 
            user_id: fromProfile.id,
            rank_code: fromGamification?.rank_code || null
          } : null,
          to_profile: toProfile ? { 
            ...toProfile, 
            user_id: toProfile.id,
            rank_code: toGamification?.rank_code || null
          } : null
        }
      })

      return NextResponse.json({ requests: requestsWithProfiles })
    }

    return NextResponse.json({ requests: [] })
  } catch (error) {
    console.error('Error fetching friend requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

