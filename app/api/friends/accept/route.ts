import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AcceptFriendRequestPayload } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: AcceptFriendRequestPayload = await request.json()
    const { request_id } = body

    if (!request_id) {
      return NextResponse.json({ error: 'request_id is required' }, { status: 400 })
    }

    // Use the database function to accept the request (handles bidirectional friendship)
    const { error: acceptError } = await supabase.rpc('accept_friend_request', {
      request_id
    })

    if (acceptError) {
      console.error('Error accepting friend request:', acceptError)
      return NextResponse.json({ error: acceptError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error accepting friend request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

