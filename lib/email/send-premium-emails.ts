// Premium email sending functions
import { getResendClient, FROM_EMAIL } from './resend'
import { PremiumTrialWelcomeEmail } from './templates/premium-trial-welcome'
import { PremiumSubscriptionActiveEmail } from './templates/premium-subscription-active'
import { render } from '@react-email/render'
import { format } from 'date-fns'

interface SendTrialWelcomeEmailParams {
  email: string
  displayName: string
  trialEndDate: Date
}

export async function sendPremiumTrialWelcomeEmail({
  email,
  displayName,
  trialEndDate,
}: SendTrialWelcomeEmailParams) {
  try {
    const resend = getResendClient()
    
    const formattedDate = format(trialEndDate, 'MMMM dd, yyyy')
    
    const emailHtml = await render(
      PremiumTrialWelcomeEmail({
        displayName,
        trialEndDate: formattedDate,
      })
    )
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: '🎉 Welcome to Plate Progress Premium - Your Trial Has Started!',
      html: emailHtml,
    })
    
    if (error) {
      console.error('Error sending trial welcome email:', error)
      throw error
    }
    
    console.log('Premium trial welcome email sent:', data?.id)
    return data
  } catch (error) {
    console.error('Failed to send premium trial welcome email:', error)
    throw error
  }
}

interface SendSubscriptionActiveEmailParams {
  email: string
  displayName: string
  nextBillingDate: Date
  amount: string
}

export async function sendPremiumSubscriptionActiveEmail({
  email,
  displayName,
  nextBillingDate,
  amount,
}: SendSubscriptionActiveEmailParams) {
  try {
    const resend = getResendClient()
    
    const formattedDate = format(nextBillingDate, 'MMMM dd, yyyy')
    
    const emailHtml = await render(
      PremiumSubscriptionActiveEmail({
        displayName,
        nextBillingDate: formattedDate,
        amount,
      })
    )
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: '✅ Your Plate Progress Premium Subscription is Active',
      html: emailHtml,
    })
    
    if (error) {
      console.error('Error sending subscription active email:', error)
      throw error
    }
    
    console.log('Premium subscription active email sent:', data?.id)
    return data
  } catch (error) {
    console.error('Failed to send premium subscription active email:', error)
    throw error
  }
}

