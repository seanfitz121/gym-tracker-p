import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 })
    }

    // Search for users by display_name (case-insensitive, partial match)
    const { data: users, error } = await supabase
      .from('profile')
      .select('id, display_name, avatar_url')
      .ilike('display_name', `%${query.trim()}%`)
      .neq('id', user.id) // Exclude current user
      .limit(10)

    if (error) throw error

    // Get rank_code from user_gamification
    if (!users || users.length === 0) {
      return NextResponse.json({ users: [] })
    }

    const userIds = users.map(u => u.id)
    const { data: gamificationData } = await supabase
      .from('user_gamification')
      .select('user_id, rank_code')
      .in('user_id', userIds)
    
    const formattedUsers = users.map(u => ({
      ...u,
      user_id: u.id,
      rank_code: gamificationData?.find(g => g.user_id === u.id)?.rank_code || null
    }))

    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

