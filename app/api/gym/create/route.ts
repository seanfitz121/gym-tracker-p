import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CreateGymPayload } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateGymPayload = await request.json()
    const { code, name, description, require_approval } = body

    if (!code || !name) {
      return NextResponse.json({ error: 'code and name are required' }, { status: 400 })
    }

    // Validate gym code format (alphanumeric, 3-20 chars)
    if (!/^[A-Z0-9]{3,20}$/.test(code)) {
      return NextResponse.json({ 
        error: 'Gym code must be 3-20 uppercase alphanumeric characters' 
      }, { status: 400 })
    }

    // Create gym
    const { data: gym, error: createError } = await supabase
      .from('gym')
      .insert({
        code,
        name,
        description,
        owner_id: user.id,
        require_approval: require_approval || false
      })
      .select()
      .single()

    if (createError) {
      if (createError.code === '23505') {
        return NextResponse.json({ error: 'Gym code already exists' }, { status: 400 })
      }
      throw createError
    }

    // Auto-join owner as first member
    await supabase
      .from('gym_member')
      .insert({
        gym_code: code,
        user_id: user.id,
        opt_in: true,
        is_approved: true
      })

    return NextResponse.json({ success: true, gym })
  } catch (error) {
    console.error('Error creating gym:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

