import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { NotificationPreferences } from '@/lib/types/notifications'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// GET /api/notifications/preferences - Get user notification preferences
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: preferences, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Create default preferences if they don't exist
        const { data: newPrefs, error: createError } = await supabase
          .from('notification_preferences')
          .insert({ user_id: user.id })
          .select()
          .single()

        if (createError) {
          console.error('Error creating notification preferences:', createError)
          return NextResponse.json(
            { error: 'Failed to create preferences' },
            { status: 500 }
          )
        }

        return NextResponse.json(newPrefs, { headers: corsHeaders })
      }

      console.error('Error fetching notification preferences:', error)
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json(preferences, { headers: corsHeaders })
  } catch (error) {
    console.error('Unexpected error in GET /api/notifications/preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/notifications/preferences - Update user notification preferences
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: Partial<NotificationPreferences> = await request.json()

    const updateData: any = {}
    if (body.friend_requests !== undefined) updateData.friend_requests = body.friend_requests
    if (body.workout_reminders !== undefined) updateData.workout_reminders = body.workout_reminders
    if (body.community_interactions !== undefined) updateData.community_interactions = body.community_interactions
    if (body.patch_notes !== undefined) updateData.patch_notes = body.patch_notes
    if (body.gym_expiry !== undefined) updateData.gym_expiry = body.gym_expiry
    if (body.push_enabled !== undefined) updateData.push_enabled = body.push_enabled

    const { data: preferences, error } = await supabase
      .from('notification_preferences')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating notification preferences:', error)
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json(preferences, { headers: corsHeaders })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/notifications/preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

