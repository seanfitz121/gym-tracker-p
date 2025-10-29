# Email Setup Guide 📧

Complete guide to setting up transactional emails and customizing auth emails for Plate Progress.

## Overview

This app uses two email systems:
1. **Resend** - For transactional emails (premium notifications, etc.)
2. **Supabase Auth** - For authentication emails (signup, password reset, magic links)

---

## Part 1: Resend Setup (Premium Emails)

### 1. Create Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Add Your Domain

1. In Resend Dashboard → Domains
2. Click "Add Domain"
3. Enter `plateprogress.com`
4. Add the DNS records shown to your domain provider:
   - **MX record** - For receiving bounces
   - **TXT record** - For SPF authentication
   - **CNAME records** - For DKIM signing

**Example DNS Records:**
```
Type: MX
Name: @
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10

Type: TXT
Name: @
Value: v=spf1 include:amazonses.com ~all

Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com

Type: CNAME
Name: resend2._domainkey
Value: resend2._domainkey.resend.com
```

5. Wait for verification (usually 15-30 minutes)

### 3. Get API Key

1. In Resend Dashboard → API Keys
2. Click "Create API Key"
3. Name: `Plate Progress Production`
4. Copy the key (starts with `re_`)

### 4. Add to Environment Variables

**Vercel:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - Name: `RESEND_API_KEY`
   - Value: `re_xxxxxxxxxxxxx`
   - Environment: Production, Preview, Development

**Local (.env.local):**
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### 5. Install Dependencies

```bash
npm install
```

This will install:
- `resend` - Email sending client
- `@react-email/render` - Email template rendering

### 6. Test Email Sending

Create a test file to verify emails work:

```typescript
// test-email.ts
import { sendPremiumTrialWelcomeEmail } from './lib/email/send-premium-emails'

sendPremiumTrialWelcomeEmail({
  email: 'your-email@example.com',
  displayName: 'Test User',
  trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
})
  .then(() => console.log('Email sent!'))
  .catch(console.error)
```

Run: `npx tsx test-email.ts`

### 7. Email Triggers

Emails are automatically sent by the webhook:

**Trial Welcome Email:**
- Trigger: User completes checkout with 7-day trial
- Webhook event: `checkout.session.completed` with status `trialing`
- Template: `lib/email/templates/premium-trial-welcome.tsx`

**Subscription Active Email:**
- Trigger: Trial ends and subscription becomes active
- Webhook event: `customer.subscription.updated` from `trialing` to `active`
- Template: `lib/email/templates/premium-subscription-active.tsx`

### 8. Monitor Emails

In Resend Dashboard → Emails:
- See all sent emails
- Check delivery status
- View open/click rates
- See bounce/complaint rates

---

## Part 2: Customize Supabase Auth Emails

### 1. Access Email Templates

1. Go to Supabase Dashboard
2. Navigate to: Authentication → Email Templates
3. You'll see 4 templates:
   - **Confirm signup** - Email verification for new users
   - **Magic Link** - Passwordless login
   - **Change Email Address** - Confirm email change
   - **Reset Password** - Password reset link

### 2. Update Each Template

For each template, replace the default with our custom versions:

**Confirm Signup:**
Copy contents from `supabase/email-templates/confirm-signup.html`

**Magic Link:**
Copy contents from `supabase/email-templates/magic-link.html`

**Reset Password:**
Copy contents from `supabase/email-templates/reset-password.html`

### 3. Important Variables

These Supabase variables must stay in the templates:

- `{{ .ConfirmationURL }}` - The actual link users click
- `{{ .Token }}` - Verification token (if using custom links)
- `{{ .Email }}` - User's email address
- `{{ .SiteURL }}` - Your app URL

### 4. Configure Email Settings

In Supabase Dashboard → Authentication → Settings:

**Sender Name:**
```
Plate Progress
```

**Sender Email:**
```
no-reply@plateprogress.com
```

**Site URL:**
```
https://plateprogress.com
```

**Redirect URLs** (add these):
```
https://plateprogress.com/app/dashboard
https://plateprogress.com/app/log
https://plateprogress.com/*
```

### 5. Test Auth Emails

**Test Signup Email:**
1. Sign out of your app
2. Go to `/auth`
3. Sign up with a new email
4. Check inbox for confirmation email
5. Verify branding and styling

**Test Password Reset:**
1. Go to `/auth`
2. Click "Forgot password"
3. Enter email
4. Check inbox for reset email

**Test Magic Link:**
1. Enable in Supabase: Authentication → Providers → Email → Enable "Magic Link"
2. Go to `/auth`
3. Enter email without password
4. Check inbox for magic link

---

## Email Deliverability Tips

### 1. Domain Authentication

✅ **DO:**
- Add all DNS records for your domain
- Wait for full verification before sending
- Use a subdomain like `mail.plateprogress.com` if main domain has issues

❌ **DON'T:**
- Send from unverified domains
- Use free email services (Gmail, Outlook) as sender

### 2. Email Content

✅ **DO:**
- Include physical address in footer (legal requirement)
- Provide unsubscribe link for marketing emails
- Keep HTML clean and valid
- Test on multiple email clients

❌ **DON'T:**
- Use spammy words ("FREE", "CLICK NOW", "LIMITED TIME")
- Send emails too frequently
- Use all caps in subject lines
- Include too many links

### 3. Monitoring

**Watch These Metrics:**
- **Delivery Rate:** Should be > 95%
- **Bounce Rate:** Should be < 5%
- **Complaint Rate:** Should be < 0.1%
- **Open Rate:** 20-30% is normal for transactional emails

**If Deliverability Issues:**
1. Check Resend Dashboard for bounces/complaints
2. Verify DNS records are correct
3. Reduce sending frequency
4. Review email content for spam triggers
5. Check domain reputation: [mail-tester.com](https://www.mail-tester.com)

---

## Email Templates Structure

### File Organization

```
lib/email/
├── resend.ts                              # Resend client setup
├── send-premium-emails.ts                 # Email sending functions
└── templates/
    ├── premium-trial-welcome.tsx          # Trial start email
    └── premium-subscription-active.tsx    # Subscription active email

supabase/email-templates/
├── confirm-signup.html                    # Supabase signup email
├── magic-link.html                        # Supabase magic link email
└── reset-password.html                    # Supabase password reset email
```

### Creating New Email Templates

To add a new transactional email:

1. **Create Template** (`lib/email/templates/your-email.tsx`):
```tsx
import * as React from 'react'

interface YourEmailProps {
  name: string
  // ... other props
}

export const YourEmail = ({ name }: YourEmailProps) => (
  <html>
    <head>
      <style>{`/* CSS here */`}</style>
    </head>
    <body>
      <p>Hey {name}!</p>
      {/* HTML here */}
    </body>
  </html>
)
```

2. **Create Send Function** (add to `lib/email/send-premium-emails.ts`):
```typescript
export async function sendYourEmail({ email, name }: { email: string, name: string }) {
  const resend = getResendClient()
  const emailHtml = render(YourEmail({ name }))
  
  return await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Your Subject Line',
    html: emailHtml,
  })
}
```

3. **Call It** (wherever needed):
```typescript
import { sendYourEmail } from '@/lib/email/send-premium-emails'

await sendYourEmail({
  email: user.email,
  name: user.display_name,
})
```

---

## Troubleshooting

### Emails Not Sending

**Check:**
1. `RESEND_API_KEY` environment variable is set
2. Domain is verified in Resend
3. Check Vercel logs for webhook errors
4. Check Resend Dashboard → Emails for failures

**Common Errors:**
```
Error: RESEND_API_KEY is not set
→ Add environment variable in Vercel

Error: Domain not verified
→ Add DNS records and wait for verification

Error: Rate limit exceeded
→ Upgrade Resend plan or wait
```

### Emails Going to Spam

**Solutions:**
1. Verify all DNS records (SPF, DKIM, DMARC)
2. Warm up domain (send gradually increasing volumes)
3. Avoid spam trigger words
4. Ask users to add to contacts/whitelist
5. Include physical address in footer
6. Provide clear unsubscribe option

### Styling Issues

**Tips:**
- Use inline styles (not all email clients support `<style>` tags)
- Test on: Gmail, Outlook, Apple Mail, Yahoo
- Use [Litmus](https://litmus.com) or [Email on Acid](https://www.emailonacid.com) for testing
- Keep layouts simple (tables are more reliable than flexbox/grid)
- Use web-safe fonts

---

## Costs

### Resend Pricing

**Free Tier:**
- 3,000 emails/month
- 100 emails/day
- All features included

**Pro Tier ($20/month):**
- 50,000 emails/month
- Unlimited daily sends
- Custom sending domains
- Priority support

### Supabase Emails

**Included:**
- Authentication emails are free
- No limits on signup/reset emails
- Uses Supabase's SMTP

---

## Next Steps

- [ ] Set up Resend account and verify domain
- [ ] Add `RESEND_API_KEY` to environment variables
- [ ] Deploy updated webhook code
- [ ] Test premium trial signup
- [ ] Customize Supabase auth email templates
- [ ] Test all auth email flows
- [ ] Monitor deliverability metrics
- [ ] Set up email alerts for bounces/complaints

---

## Support

**Resend Issues:**
- [Resend Docs](https://resend.com/docs)
- [Resend Support](https://resend.com/support)

**Supabase Email Issues:**
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Discord](https://discord.supabase.com)

**General Questions:**
- Email: support@plateprogress.com
- Check Vercel logs
- Check Resend Dashboard

---

**Ready to launch!** 🚀

Emails will automatically send when users sign up for premium trials and when trials convert to active subscriptions.

