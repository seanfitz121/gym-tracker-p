import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already has a pending or processing deletion request
    const { data: existingRequests } = await supabase
      .from('data_requests')
      .select('id, status, created_at')
      .eq('user_id', user.id)
      .eq('request_type', 'deletion')
      .in('status', ['pending', 'processing'])
      .order('created_at', { ascending: false })
      .limit(1)

    if (existingRequests && existingRequests.length > 0) {
      return NextResponse.json(
        { error: 'You already have a pending deletion request.' },
        { status: 400 }
      )
    }

    // Create new deletion request
    const { data: newRequest, error: insertError } = await supabase
      .from('data_requests')
      .insert({
        user_id: user.id,
        request_type: 'deletion',
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating deletion request:', insertError)
      return NextResponse.json({ error: 'Failed to create deletion request' }, { status: 500 })
    }

    // TODO: In a production environment, you would:
    // 1. Send confirmation email with a confirmation link
    // 2. User clicks link to confirm (prevent accidental deletions)
    // 3. Trigger async job to delete all user data from all tables
    // 4. Delete user from auth.users (cascades to most tables due to ON DELETE CASCADE)
    // 5. Update request status to 'completed'
    // 6. Send final confirmation email

    // For demo purposes, we'll just create the request
    // IMPORTANT: Do NOT automatically delete the account - require confirmation!

    return NextResponse.json({
      success: true,
      message: 'Account deletion request created. You will receive a confirmation email with next steps.',
      request: newRequest,
    })
  } catch (error: any) {
    console.error('Error in data deletion endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint to check deletion request status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's deletion requests
    const { data: requests, error } = await supabase
      .from('data_requests')
      .select('*')
      .eq('user_id', user.id)
      .eq('request_type', 'deletion')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Error fetching deletion requests:', error)
      return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
    }

    return NextResponse.json({ requests })
  } catch (error: any) {
    console.error('Error in data deletion GET endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

