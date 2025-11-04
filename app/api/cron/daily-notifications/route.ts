import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notifyWorkoutReminder, notifyGymExpiry } from '@/lib/utils/notification-service'
import { differenceInDays } from 'date-fns'

// Combined cron job for daily notifications
// Runs daily at 9 AM UTC to check for:
// 1. Users who haven't logged a workout in 7+ days
// 2. Users with gym memberships expiring in 3 days

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (if using Vercel Cron or similar)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    // ============================================
    // PART 1: Workout Reminders
    // ============================================
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: usersForReminders, error: remindersError } = await supabase
      .from('notification_preferences')
      .select(`
        user_id,
        profile:profile!inner(id)
      `)
      .eq('workout_reminders', true)

    let workoutRemindersSent = 0
    const workoutErrors: string[] = []

    if (!remindersError && usersForReminders && usersForReminders.length > 0) {
      for (const pref of usersForReminders) {
        try {
          const { data: lastWorkout } = await supabase
            .from('workout_session')
            .select('started_at')
            .eq('user_id', pref.user_id)
            .order('started_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          const needsReminder = !lastWorkout || 
            new Date(lastWorkout.started_at) < sevenDaysAgo

          if (needsReminder) {
            const daysSince = lastWorkout
              ? Math.floor((Date.now() - new Date(lastWorkout.started_at).getTime()) / (1000 * 60 * 60 * 24))
              : 999

            const oneDayAgo = new Date()
            oneDayAgo.setDate(oneDayAgo.getDate() - 1)

            const { data: recentNotification } = await supabase
              .from('notifications')
              .select('id')
              .eq('user_id', pref.user_id)
              .eq('type', 'workout_reminder')
              .gte('created_at', oneDayAgo.toISOString())
              .maybeSingle()

            if (!recentNotification) {
              await notifyWorkoutReminder(pref.user_id, daysSince)
              workoutRemindersSent++
            }
          }
        } catch (userError) {
          workoutErrors.push(`User ${pref.user_id}: ${userError}`)
          console.error(`Error processing workout reminder for user ${pref.user_id}:`, userError)
        }
      }
    }

    // ============================================
    // PART 2: Gym Expiry Warnings
    // ============================================
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

    const { data: usersForExpiry, error: expiryError } = await supabase
      .from('notification_preferences')
      .select(`
        user_id,
        profile:profile!inner(
          id,
          gym_expiry_date
        )
      `)
      .eq('gym_expiry', true)

    let gymExpirySent = 0
    const gymErrors: string[] = []

    if (!expiryError && usersForExpiry && usersForExpiry.length > 0) {
      for (const pref of usersForExpiry) {
        try {
          const profile = pref.profile as any
          const gymExpiryDate = profile?.gym_expiry_date

          if (!gymExpiryDate) {
            continue
          }

          const expiryDate = new Date(gymExpiryDate)
          const daysUntilExpiry = differenceInDays(expiryDate, new Date())

          if (daysUntilExpiry >= 2 && daysUntilExpiry <= 3) {
            const oneDayAgo = new Date()
            oneDayAgo.setDate(oneDayAgo.getDate() - 1)

            const { data: recentNotification } = await supabase
              .from('notifications')
              .select('id')
              .eq('user_id', pref.user_id)
              .eq('type', 'gym_expiry')
              .gte('created_at', oneDayAgo.toISOString())
              .maybeSingle()

            if (!recentNotification) {
              await notifyGymExpiry(pref.user_id, daysUntilExpiry)
              gymExpirySent++
            }
          }
        } catch (userError) {
          gymErrors.push(`User ${pref.user_id}: ${userError}`)
          console.error(`Error processing gym expiry for user ${pref.user_id}:`, userError)
        }
      }
    }

    return NextResponse.json({
      message: 'Daily notifications processed',
      workout_reminders: {
        sent: workoutRemindersSent,
        errors: workoutErrors.length > 0 ? workoutErrors : undefined,
      },
      gym_expiry: {
        sent: gymExpirySent,
        errors: gymErrors.length > 0 ? gymErrors : undefined,
      },
    })
  } catch (error) {
    console.error('Unexpected error in daily notifications cron:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

