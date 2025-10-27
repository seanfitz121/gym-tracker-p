import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { JoinGymPayload } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: JoinGymPayload = await request.json()
    const { gym_code } = body

    if (!gym_code) {
      return NextResponse.json({ error: 'gym_code is required' }, { status: 400 })
    }

    // Check if gym exists
    // @ts-ignore - Table exists but types not yet regenerated
    const { data: gym, error: gymError } = await supabase
      .from('gym')
      .select('*')
      .eq('code', gym_code)
      .single()

    if (gymError || !gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 })
    }

    // Check if already a member
    // @ts-ignore - Table exists but types not yet regenerated
    const { data: existingMember } = await supabase
      .from('gym_member')
      .select('*')
      .eq('gym_code', gym_code)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      return NextResponse.json({ error: 'Already a member' }, { status: 400 })
    }

    // Join gym (approval status depends on gym settings)
    // @ts-ignore - Table exists but types not yet regenerated
    const { data: membership, error: joinError } = await supabase
      .from('gym_member')
      .insert({
        gym_code,
        user_id: user.id,
        opt_in: true,
        is_approved: !gym.require_approval // Auto-approve if not required
      })
      .select()
      .single()

    if (joinError) throw joinError

    return NextResponse.json({ 
      success: true, 
      membership,
      requires_approval: gym.require_approval
    })
  } catch (error) {
    console.error('Error joining gym:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

