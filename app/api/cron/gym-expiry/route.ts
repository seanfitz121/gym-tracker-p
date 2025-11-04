import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notifyGymExpiry } from '@/lib/utils/notification-service'
import { differenceInDays } from 'date-fns'

// This endpoint should be called by a cron job daily
// Checks for gym memberships expiring in 3 days

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    // Calculate date 3 days from now
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
    const threeDaysFromNowStr = threeDaysFromNow.toISOString().split('T')[0] // YYYY-MM-DD

    // Calculate date 2 days from now (to avoid duplicate notifications)
    const twoDaysFromNow = new Date()
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2)
    const twoDaysFromNowStr = twoDaysFromNow.toISOString().split('T')[0]

    // Find users with gym_expiry notifications enabled who have gym_expiry_date in 3 days
    const { data: usersNeedingWarning, error } = await supabase
      .from('notification_preferences')
      .select(`
        user_id,
        profile:profile!inner(
          id,
          gym_expiry_date
        )
      `)
      .eq('gym_expiry', true)

    if (error) {
      console.error('Error fetching users for gym expiry warnings:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    if (!usersNeedingWarning || usersNeedingWarning.length === 0) {
      return NextResponse.json({ 
        message: 'No users need gym expiry warnings',
        sent: 0 
      })
    }

    let sentCount = 0
    const errors: string[] = []

    // Check each user's gym expiry date
    for (const pref of usersNeedingWarning) {
      try {
        const profile = pref.profile as any
        const gymExpiryDate = profile?.gym_expiry_date

        if (!gymExpiryDate) {
          continue // No expiry date set
        }

        // Check if expiry is in 3 days (between 2 and 3 days from now)
        const expiryDate = new Date(gymExpiryDate)
        const daysUntilExpiry = differenceInDays(expiryDate, new Date())

        // Only notify if exactly 3 days away (or between 2.5-3.5 days to account for timing)
        if (daysUntilExpiry >= 2 && daysUntilExpiry <= 3) {
          // Check if we've already sent a notification in the last 24 hours
          const oneDayAgo = new Date()
          oneDayAgo.setDate(oneDayAgo.getDate() - 1)

          const { data: recentNotification } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', pref.user_id)
            .eq('type', 'gym_expiry')
            .gte('created_at', oneDayAgo.toISOString())
            .maybeSingle()

          // Only send if no notification sent in last 24 hours
          if (!recentNotification) {
            await notifyGymExpiry(pref.user_id, daysUntilExpiry)
            sentCount++
          }
        }
      } catch (userError) {
        errors.push(`User ${pref.user_id}: ${userError}`)
        console.error(`Error processing user ${pref.user_id}:`, userError)
      }
    }

    return NextResponse.json({
      message: 'Gym expiry warnings processed',
      sent: sentCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Unexpected error in gym expiry cron:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

