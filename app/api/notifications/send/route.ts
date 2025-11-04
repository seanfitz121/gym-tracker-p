import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createNotification,
  notifyFriendRequest,
  notifyWorkoutReminder,
  notifyCommunityInteraction,
  notifyPatchNotes,
  notifyGymExpiry,
} from '@/lib/utils/notification-service'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// POST /api/notifications/send - Send a notification (admin/internal use)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId, type, ...data } = body

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'Missing userId or type' },
        { status: 400 }
      )
    }

    let notificationId: string | null = null

    switch (type) {
      case 'friend_request':
        notificationId = await notifyFriendRequest(
          userId,
          data.fromUserName,
          data.requestId
        )
        break
      case 'workout_reminder':
        notificationId = await notifyWorkoutReminder(
          userId,
          data.daysSinceLastWorkout || 7
        )
        break
      case 'community_interaction':
        notificationId = await notifyCommunityInteraction(
          userId,
          data.interactionType,
          data.postTitle,
          data.userName,
          data.postId
        )
        break
      case 'patch_notes':
        notificationId = await notifyPatchNotes(
          userId,
          data.version,
          data.notes
        )
        break
      case 'gym_expiry':
        notificationId = await notifyGymExpiry(
          userId,
          data.daysRemaining
        )
        break
      default:
        notificationId = await createNotification(userId, {
          type,
          title: data.title,
          body: data.body,
          url: data.url,
          data: data.data,
        })
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, notificationId }, { headers: corsHeaders })
  } catch (error) {
    console.error('Unexpected error in POST /api/notifications/send:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

