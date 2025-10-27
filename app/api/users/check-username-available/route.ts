import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      return NextResponse.json({ 
        error: 'Username must be 3-20 characters (letters, numbers, _, -)' 
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if username exists (using service role to bypass RLS)
    const { data, error } = await supabase
      .from('profile')
      .select('username')
      .eq('username', username)
      .maybeSingle()

    if (error) {
      console.error('Error checking username:', error)
      throw error
    }

    return NextResponse.json({ 
      available: !data,
      username 
    })
  } catch (error) {
    console.error('Error checking username availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

