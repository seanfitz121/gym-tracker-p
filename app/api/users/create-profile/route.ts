import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { username, displayName } = await request.json()

    if (!username) {
      return NextResponse.json({ 
        error: 'Username is required' 
      }, { status: 400 })
    }

    const supabase = await createClient()
    
    // SECURITY: Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    // Create the profile using authenticated user's ID
    const { data, error } = await supabase
      .from('profile')
      .insert({
        id: user.id, // Use auth.uid() instead of client-provided userId
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

