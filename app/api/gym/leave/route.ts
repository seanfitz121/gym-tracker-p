import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { gym_code } = await request.json()

    if (!gym_code) {
      return NextResponse.json({ error: 'gym_code is required' }, { status: 400 })
    }

    // Remove membership
    // @ts-ignore - Table exists but types not yet regenerated
    const { error: deleteError } = await supabase
      .from('gym_member')
      .delete()
      .eq('gym_code', gym_code)
      .eq('user_id', user.id)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error leaving gym:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

