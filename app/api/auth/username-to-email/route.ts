import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get the user ID from profile
    const { data: profile, error: profileError } = await supabase
      .from('profile')
      .select('id')
      .eq('username', username)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the email from auth.users via admin client
    // Note: This requires service_role key to access auth.users
    // For security, we'll use a database function instead
    const { data, error } = await supabase.rpc('get_email_by_user_id', {
      user_id: profile.id
    })

    if (error || !data) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 })
    }

    return NextResponse.json({ email: data })
  } catch (error) {
    console.error('Error getting email from username:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

