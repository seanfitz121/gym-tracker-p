import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { code: gymCode } = await params

    // Get gym details
    // @ts-ignore - Table exists but types not yet regenerated
    const { data: gym, error: gymError } = await supabase
      .from('gym')
      .select('*')
      .eq('code', gymCode)
      .single()

    if (gymError || !gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 })
    }

    // Get member count
    // @ts-ignore - Table exists but types not yet regenerated
    const { count: memberCount } = await supabase
      .from('gym_member')
      .select('*', { count: 'exact', head: true })
      .eq('gym_code', gymCode)
      .eq('is_approved', true)

    // Check if current user is a member
    let userIsMember = false
    let userIsOwner = false

    if (user) {
      // @ts-ignore - Table exists but types not yet regenerated
      const { data: membership } = await supabase
        .from('gym_member')
        .select('*')
        .eq('gym_code', gymCode)
        .eq('user_id', user.id)
        .single()

      userIsMember = !!membership
      userIsOwner = gym.owner_id === user.id
    }

    return NextResponse.json({
      gym: {
        ...gym,
        member_count: memberCount || 0,
        user_is_member: userIsMember,
        user_is_owner: userIsOwner
      }
    })
  } catch (error) {
    console.error('Error fetching gym:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

