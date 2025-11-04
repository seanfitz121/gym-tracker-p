// Notification service for creating and sending notifications
import { createClient } from '@/lib/supabase/server'
import type { NotificationType } from '@/lib/types/notifications'

// Dynamic import for web-push (server-side only)
let webpush: any = null
async function getWebPush() {
  if (!webpush && typeof window === 'undefined') {
    webpush = (await import('web-push')).default
    
    // Initialize web-push (VAPID keys should be in environment variables)
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:support@plateprogress.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      )
    }
  }
  return webpush
}

interface NotificationData {
  type: NotificationType
  title: string
  body: string
  url?: string
  data?: Record<string, any>
}

export async function createNotification(
  userId: string,
  notification: NotificationData
): Promise<string | null> {
  try {
    const supabase = await createClient()

    // Check user preferences
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!preferences) {
      return null
    }

    // Check if this notification type is enabled
    const typeEnabled = {
      friend_request: preferences.friend_requests,
      workout_reminder: preferences.workout_reminders,
      community_interaction: preferences.community_interactions,
      patch_notes: preferences.patch_notes,
      gym_expiry: preferences.gym_expiry,
    }[notification.type]

    if (!typeEnabled) {
      return null
    }

    // Create in-app notification
    const { data: inAppNotification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        read: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating in-app notification:', error)
      return null
    }

    // Send push notification if enabled
    if (preferences.push_enabled) {
      await sendPushNotification(userId, {
        ...notification,
        notificationId: inAppNotification.id,
      })
    }

    return inAppNotification.id
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

async function sendPushNotification(
  userId: string,
  notification: NotificationData & { notificationId: string }
) {
  try {
    const supabase = await createClient()
    const webpushInstance = await getWebPush()
    
    if (!webpushInstance) {
      console.warn('web-push not initialized, skipping push notification')
      return
    }

    // Get user's push subscriptions
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('enabled', true)

    if (!subscriptions || subscriptions.length === 0) {
      return
    }

    // Send to each subscription
    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      type: notification.type,
      tag: notification.type,
      url: notification.url || '/',
      notificationId: notification.notificationId,
      data: notification.data,
    })

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webpushInstance.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload
        )
      } catch (error: any) {
        // If subscription is invalid, delete it
        if (error.statusCode === 410 || error.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', sub.id)
        }
        console.error('Error sending push notification:', error)
      }
    })

    await Promise.allSettled(sendPromises)
  } catch (error) {
    console.error('Error sending push notifications:', error)
  }
}

// Helper functions for specific notification types
export async function notifyFriendRequest(userId: string, fromUserName: string, requestId: string) {
  return createNotification(userId, {
    type: 'friend_request',
    title: 'New Friend Request',
    body: `${fromUserName} sent you a friend request`,
    url: '/app/social',
    data: { requestId },
  })
}

export async function notifyWorkoutReminder(userId: string, daysSinceLastWorkout: number) {
  return createNotification(userId, {
    type: 'workout_reminder',
    title: 'Time to Work Out!',
    body: `It's been ${daysSinceLastWorkout} days since your last workout. Let's get back to it!`,
    url: '/app/log',
  })
}

export async function notifyCommunityInteraction(
  userId: string,
  type: 'like' | 'comment',
  postTitle: string,
  userName: string,
  postId: string
) {
  const action = type === 'like' ? 'liked' : 'commented on'
  return createNotification(userId, {
    type: 'community_interaction',
    title: 'Community Activity',
    body: `${userName} ${action} your post: "${postTitle}"`,
    url: `/app/community/${postId}`,
    data: { postId, type },
  })
}

export async function notifyPatchNotes(userId: string, version: string, notes: string) {
  return createNotification(userId, {
    type: 'patch_notes',
    title: `New Update: ${version}`,
    body: notes,
    url: '/app/settings',
    data: { version },
  })
}

export async function notifyGymExpiry(userId: string, daysRemaining: number) {
  return createNotification(userId, {
    type: 'gym_expiry',
    title: '⚠️ Gym Membership Expiring Soon!',
    body: `Your gym membership expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. Renew now to avoid interruption.`,
    url: '/app/dashboard',
    data: { daysRemaining },
  })
}

