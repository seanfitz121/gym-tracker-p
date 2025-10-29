import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const supabase = await createClient()
    const { code: gymCode } = await params

    // Get gym members
    const { data: members, error } = await supabase
      .from('gym_member')
      .select('user_id, joined_at, opt_in, is_approved')
      .eq('gym_code', gymCode)
      .eq('is_approved', true)
      .order('joined_at', { ascending: false })

    if (error) throw error
    if (!members || members.length === 0) {
      return NextResponse.json({ members: [] })
    }

    // Get profiles for members
    const memberIds = members.map(m => m.user_id)
    const { data: profiles } = await supabase
      .from('profile')
      .select('id, display_name, avatar_url, is_premium, premium_flair_enabled')
      .in('id', memberIds)

    // Get rank_code from user_gamification
    const { data: gamificationData } = await supabase
      .from('user_gamification')
      .select('user_id, rank_code')
      .in('user_id', memberIds)

    // Attach profiles to members
    const membersWithProfiles = members.map(member => {
      const profile = profiles?.find(p => p.id === member.user_id)
      const gamification = gamificationData?.find(g => g.user_id === member.user_id)
      return {
        ...member,
        profile: profile ? { 
          ...profile, 
          user_id: profile.id,
          rank_code: gamification?.rank_code || null,
          is_premium: profile.is_premium || false,
          premium_flair_enabled: profile.premium_flair_enabled ?? true
        } : null
      }
    })

    return NextResponse.json({ members: membersWithProfiles })
  } catch (error) {
    console.error('Error fetching gym members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

