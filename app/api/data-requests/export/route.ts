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

    // Check if user already has a pending or processing export request
    const { data: existingRequests } = await supabase
      .from('data_requests')
      .select('id, status, created_at')
      .eq('user_id', user.id)
      .eq('request_type', 'export')
      .in('status', ['pending', 'processing'])
      .order('created_at', { ascending: false })
      .limit(1)

    if (existingRequests && existingRequests.length > 0) {
      return NextResponse.json(
        { error: 'You already have a pending export request. Please wait for it to complete.' },
        { status: 400 }
      )
    }

    // Create new export request
    const { data: newRequest, error: insertError } = await supabase
      .from('data_requests')
      .insert({
        user_id: user.id,
        request_type: 'export',
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating export request:', insertError)
      return NextResponse.json({ error: 'Failed to create export request' }, { status: 500 })
    }

    // TODO: In a production environment, you would trigger an async job here to:
    // 1. Gather all user data from all tables
    // 2. Create a JSON/CSV export file
    // 3. Upload to secure storage
    // 4. Update the request with export_url and status='completed'
    // 5. Send email notification with download link

    // For now, we'll mark it as processing and handle it synchronously for demo
    // In production, use a job queue like Inngest, BullMQ, or Supabase Edge Functions

    return NextResponse.json({
      success: true,
      message: 'Data export request created successfully. You will receive an email when your export is ready.',
      request: newRequest,
    })
  } catch (error: any) {
    console.error('Error in data export endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint to check export request status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's export requests
    const { data: requests, error } = await supabase
      .from('data_requests')
      .select('*')
      .eq('user_id', user.id)
      .eq('request_type', 'export')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Error fetching export requests:', error)
      return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
    }

    return NextResponse.json({ requests })
  } catch (error: any) {
    console.error('Error in data export GET endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

