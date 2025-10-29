// Resend email client
import { Resend } from 'resend'

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set')
  }
  
  return new Resend(apiKey)
}

export const FROM_EMAIL = 'Plate Progress <no-reply@plateprogress.com>'
export const SUPPORT_EMAIL = 'support@plateprogress.com'

