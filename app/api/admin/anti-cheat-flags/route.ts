import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Get anti-cheat flags
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_user')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'

    // @ts-ignore - Table exists but types not yet regenerated
    let query = supabase
      .from('anti_cheat_flag')
      .select('*')
      .order('flagged_at', { ascending: false })

    if (status === 'pending') {
      query = query.eq('status', 'pending')
    }

    const { data: flags, error } = await query

    if (error) throw error
    if (!flags || flags.length === 0) {
      return NextResponse.json({ flags: [] })
    }

    // Get profiles for flagged users
    const userIds = flags.map(f => f.user_id)
    const { data: profiles } = await supabase
      .from('profile')
      .select('user_id, display_name, avatar_url')
      .in('user_id', userIds)

    // Attach profiles to flags
    const flagsWithProfiles = flags.map(flag => ({
      ...flag,
      user_profile: profiles?.find(p => p.user_id === flag.user_id)
    }))

    return NextResponse.json({ flags: flagsWithProfiles })
  } catch (error) {
    console.error('Error fetching anti-cheat flags:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Review a flag (clear or confirm)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_user')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { flag_id, action, notes } = await request.json()

    if (!flag_id || !action) {
      return NextResponse.json({ error: 'flag_id and action are required' }, { status: 400 })
    }

    const newStatus = action === 'clear' ? 'cleared' : 'confirmed'

      // @ts-ignore - Table exists but types not yet regenerated
      const { error: updateError } = await supabase
      .from('anti_cheat_flag')
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        notes: notes || null
      })
      .eq('id', flag_id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reviewing flag:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

