import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's gym membership
    const { data: membership } = await supabase
      .from('gym_member')
      .select('gym_code, is_approved')
      .eq('user_id', user.id)
      .single()

    if (!membership || !membership.is_approved) {
      return NextResponse.json({ gym: null })
    }

    // Get gym details
    const { data: gym, error: gymError } = await supabase
      .from('gym')
      .select('*')
      .eq('code', membership.gym_code)
      .single()

    if (gymError || !gym) {
      return NextResponse.json({ gym: null })
    }

    // Get member count
    const { count: memberCount } = await supabase
      .from('gym_member')
      .select('*', { count: 'exact', head: true })
      .eq('gym_code', gym.code)
      .eq('is_approved', true)

    return NextResponse.json({
      gym: {
        ...gym,
        member_count: memberCount || 0,
        user_is_member: true,
        user_is_owner: gym.owner_id === user.id
      }
    })
  } catch (error) {
    console.error('Error fetching user gym:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

