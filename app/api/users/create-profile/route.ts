import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, username, displayName } = await request.json()

    if (!userId || !username) {
      return NextResponse.json({ 
        error: 'User ID and username are required' 
      }, { status: 400 })
    }

    const supabase = await createClient()

    // Create the profile
    const { data, error } = await supabase
      .from('profile')
      .insert({
        id: userId,
        username,
        display_name: displayName || username,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating profile:', error)
      
      // If profile already exists, that's okay
      if (error.code === '23505') {
        return NextResponse.json({ 
          success: true,
          message: 'Profile already exists' 
        })
      }
      
      throw error
    }

    return NextResponse.json({ success: true, profile: data })
  } catch (error: any) {
    console.error('Error creating profile:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}

