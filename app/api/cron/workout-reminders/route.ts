import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notifyWorkoutReminder } from '@/lib/utils/notification-service'

// This endpoint should be called by a cron job (e.g., Vercel Cron, Supabase Edge Functions, etc.)
// Runs daily to check for users who haven't logged a workout in 7+ days

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (if using Vercel Cron or similar)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    // Calculate date 7 days ago
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Find users with workout_reminders enabled who haven't logged a workout in 7+ days
    const { data: usersNeedingReminder, error } = await supabase
      .from('notification_preferences')
      .select(`
        user_id,
        profile:profile!inner(id)
      `)
      .eq('workout_reminders', true)

    if (error) {
      console.error('Error fetching users for workout reminders:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    if (!usersNeedingReminder || usersNeedingReminder.length === 0) {
      return NextResponse.json({ 
        message: 'No users need workout reminders',
        sent: 0 
      })
    }

    let sentCount = 0
    const errors: string[] = []

    // Check each user's last workout
    for (const pref of usersNeedingReminder) {
      try {
        // Get user's most recent workout session
        const { data: lastWorkout } = await supabase
          .from('workout_session')
          .select('started_at')
          .eq('user_id', pref.user_id)
          .order('started_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        // Check if last workout was more than 7 days ago (or no workouts)
        const needsReminder = !lastWorkout || 
          new Date(lastWorkout.started_at) < sevenDaysAgo

        if (needsReminder) {
          // Calculate days since last workout
          const daysSince = lastWorkout
            ? Math.floor((Date.now() - new Date(lastWorkout.started_at).getTime()) / (1000 * 60 * 60 * 24))
            : 999 // No workouts ever

          // Check if we've already sent a reminder in the last 24 hours
          const oneDayAgo = new Date()
          oneDayAgo.setDate(oneDayAgo.getDate() - 1)

          const { data: recentNotification } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', pref.user_id)
            .eq('type', 'workout_reminder')
            .gte('created_at', oneDayAgo.toISOString())
            .maybeSingle()

          // Only send if no reminder sent in last 24 hours
          if (!recentNotification) {
            await notifyWorkoutReminder(pref.user_id, daysSince)
            sentCount++
          }
        }
      } catch (userError) {
        errors.push(`User ${pref.user_id}: ${userError}`)
        console.error(`Error processing user ${pref.user_id}:`, userError)
      }
    }

    return NextResponse.json({
      message: 'Workout reminders processed',
      sent: sentCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Unexpected error in workout reminders cron:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

