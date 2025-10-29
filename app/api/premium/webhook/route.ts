import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { sendPremiumTrialWelcomeEmail, sendPremiumSubscriptionActiveEmail } from '@/lib/email/send-premium-emails'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-09-30.clover',
  })
}

function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase environment variables are not set')
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe()
    const supabaseAdmin = getSupabaseAdmin()
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log('Stripe webhook event:', event.type)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id

        if (!userId) {
          console.error('No user ID in session metadata')
          break
        }

        // Get subscription details
        const subscriptionResponse = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        // Map Stripe status to our status
        let status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing' = 'inactive'
        if (subscriptionResponse.status === 'active') status = 'active'
        else if (subscriptionResponse.status === 'canceled') status = 'canceled'
        else if (subscriptionResponse.status === 'past_due') status = 'past_due'
        else if (subscriptionResponse.status === 'trialing') status = 'trialing'

        // Upsert subscription record
        await supabaseAdmin
          .from('premium_subscription')
          .upsert({
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscriptionResponse.id,
            stripe_price_id: subscriptionResponse.items.data[0].price.id,
            status,
            current_period_start: new Date((subscriptionResponse as any).current_period_start * 1000).toISOString(),
            current_period_end: new Date((subscriptionResponse as any).current_period_end * 1000).toISOString(),
            cancel_at_period_end: (subscriptionResponse as any).cancel_at_period_end,
          })

        console.log('Subscription created for user:', userId, 'with status:', status)

        // Send welcome email for trial
        if (status === 'trialing') {
          try {
            // Get user profile for display name and email
            const { data: profile } = await supabaseAdmin
              .from('profile')
              .select('display_name, email')
              .eq('id', userId)
              .single()

            if (profile?.email) {
              await sendPremiumTrialWelcomeEmail({
                email: profile.email,
                displayName: profile.display_name || 'there',
                trialEndDate: new Date((subscriptionResponse as any).current_period_end * 1000),
              })
              console.log('Welcome email sent to:', profile.email)
            }
          } catch (emailError) {
            // Log but don't fail the webhook
            console.error('Failed to send welcome email:', emailError)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by customer ID
        const { data: existingSub } = await supabaseAdmin
          .from('premium_subscription')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!existingSub) {
          console.error('No subscription found for customer:', customerId)
          break
        }

        // Map Stripe status to our status
        let status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing' = 'inactive'
        if (subscription.status === 'active') status = 'active'
        else if (subscription.status === 'canceled') status = 'canceled'
        else if (subscription.status === 'past_due') status = 'past_due'
        else if (subscription.status === 'trialing') status = 'trialing'

        // Check if transitioning from trial to active
        const wasTrialing = existingSub && subscription.status === 'active' && 
                           (subscription as any).trial_end && 
                           new Date((subscription as any).trial_end * 1000) < new Date()

        // Update subscription
        await supabaseAdmin
          .from('premium_subscription')
          .update({
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0].price.id,
            status,
            current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            cancel_at_period_end: (subscription as any).cancel_at_period_end,
          })
          .eq('stripe_customer_id', customerId)

        console.log('Subscription updated for customer:', customerId)

        // Send email when trial ends and subscription becomes active
        if (wasTrialing && status === 'active') {
          try {
            // Get user profile
            const { data: profile } = await supabaseAdmin
              .from('profile')
              .select('display_name, email')
              .eq('id', existingSub.user_id)
              .single()

            if (profile?.email) {
              // Get price for display
              const price = subscription.items.data[0].price
              const amount = price.currency === 'eur' 
                ? `€${(price.unit_amount! / 100).toFixed(2)}`
                : `$${(price.unit_amount! / 100).toFixed(2)}`

              await sendPremiumSubscriptionActiveEmail({
                email: profile.email,
                displayName: profile.display_name || 'there',
                nextBillingDate: new Date((subscription as any).current_period_end * 1000),
                amount,
              })
              console.log('Subscription active email sent to:', profile.email)
            }
          } catch (emailError) {
            // Log but don't fail the webhook
            console.error('Failed to send subscription active email:', emailError)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Mark subscription as canceled
        await supabaseAdmin
          .from('premium_subscription')
          .update({
            status: 'canceled',
            cancel_at_period_end: false,
          })
          .eq('stripe_customer_id', customerId)

        console.log('Subscription canceled for customer:', customerId)
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

