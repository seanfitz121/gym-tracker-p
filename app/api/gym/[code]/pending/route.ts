import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Get pending join requests for a gym
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code: gymCode } = await params

    // Check if user is the gym owner
    const { data: gym } = await supabase
      .from('gym')
      .select('owner_id')
      .eq('code', gymCode)
      .single()

    if (!gym || gym.owner_id !== user.id) {
      return NextResponse.json({ error: 'Only gym owners can view pending requests' }, { status: 403 })
    }

    // Get pending members
    const { data: pending, error } = await supabase
      .from('gym_member')
      .select('user_id, joined_at')
      .eq('gym_code', gymCode)
      .eq('is_approved', false)
      .order('joined_at', { ascending: false })

    if (error) throw error

    if (!pending || pending.length === 0) {
      return NextResponse.json({ requests: [] })
    }

    // Get profiles for pending members
    const userIds = pending.map(p => p.user_id)
    const { data: profiles } = await supabase
      .from('profile')
      .select('id, username, display_name, avatar_url')
      .in('id', userIds)

    // Get rank_code from user_gamification
    const { data: gamificationData } = await supabase
      .from('user_gamification')
      .select('user_id, rank_code')
      .in('user_id', userIds)

    // Combine data
    const requests = pending.map(p => {
      const profile = profiles?.find(pr => pr.id === p.user_id)
      const gamification = gamificationData?.find(g => g.user_id === p.user_id)
      return {
        user_id: p.user_id,
        username: profile?.username,
        display_name: profile?.display_name,
        avatar_url: profile?.avatar_url,
        rank_code: gamification?.rank_code,
        joined_at: p.joined_at
      }
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Error fetching pending requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Approve or reject a join request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code: gymCode } = await params
    const { user_id, action } = await request.json()

    if (!user_id || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Check if requester is the gym owner
    const { data: gym } = await supabase
      .from('gym')
      .select('owner_id')
      .eq('code', gymCode)
      .single()

    if (!gym || gym.owner_id !== user.id) {
      return NextResponse.json({ error: 'Only gym owners can manage requests' }, { status: 403 })
    }

    if (action === 'approve') {
      // Approve the request
      const { error } = await supabase
        .from('gym_member')
        .update({ is_approved: true })
        .eq('gym_code', gymCode)
        .eq('user_id', user_id)

      if (error) throw error

      return NextResponse.json({ success: true, message: 'Request approved' })
    } else {
      // Reject = delete the request
      const { error } = await supabase
        .from('gym_member')
        .delete()
        .eq('gym_code', gymCode)
        .eq('user_id', user_id)

      if (error) throw error

      return NextResponse.json({ success: true, message: 'Request rejected' })
    }
  } catch (error) {
    console.error('Error managing request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

