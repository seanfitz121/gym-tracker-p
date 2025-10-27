import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { RejectFriendRequestPayload } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: RejectFriendRequestPayload = await request.json()
    const { request_id } = body

    if (!request_id) {
      return NextResponse.json({ error: 'request_id is required' }, { status: 400 })
    }

    // Update request status to rejected
    // @ts-ignore - Table exists but types not yet regenerated
    const { error: updateError } = await supabase
      .from('friend_request')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', request_id)
      .eq('to_user', user.id) // Only the recipient can reject

    if (updateError) {
      console.error('Error rejecting friend request:', updateError)
      return NextResponse.json({ error: 'Failed to reject request' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error rejecting friend request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

