# Email Features - Deployment Checklist ✅

Quick checklist to deploy premium and auth emails.

## Pre-Deployment

- [ ] Review `EMAIL_SETUP.md` for full details
- [ ] Have access to:
  - Resend account
  - Supabase Dashboard
  - Vercel Dashboard
  - DNS provider for plateprogress.com

## Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `resend@^4.0.1`
- `@react-email/render@^1.0.1`

## Step 2: Resend Setup (15 minutes)

1. [ ] Create Resend account at [resend.com](https://resend.com)
2. [ ] Add domain `plateprogress.com` in Resend Dashboard
3. [ ] Add DNS records to your domain provider:
   - MX record
   - SPF TXT record  
   - 2 DKIM CNAME records
4. [ ] Wait for domain verification (~15-30 min)
5. [ ] Create API key in Resend Dashboard
6. [ ] Copy API key (starts with `re_`)

## Step 3: Environment Variables

**Vercel Dashboard:**
1. [ ] Go to Settings → Environment Variables
2. [ ] Add new variable:
   - Name: `RESEND_API_KEY`
   - Value: `re_xxxxxxxxxxxxx` (your API key)
   - Environments: Production, Preview, Development
3. [ ] Save

**Local Development (.env.local):**
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

## Step 4: Deploy Code

```bash
git add .
git commit -m "feat: add premium and auth email templates"
git push origin main
```

Vercel will auto-deploy (~2 minutes).

## Step 5: Customize Supabase Auth Emails (10 minutes)

1. [ ] Go to Supabase Dashboard
2. [ ] Navigate to: Authentication → Email Templates

**For each template, copy from:**

**Confirm Signup:**
- [ ] Copy from: `supabase/email-templates/confirm-signup.html`
- [ ] Paste into Supabase "Confirm signup" template
- [ ] Save

**Magic Link:**
- [ ] Copy from: `supabase/email-templates/magic-link.html`
- [ ] Paste into Supabase "Magic Link" template
- [ ] Save

**Reset Password:**
- [ ] Copy from: `supabase/email-templates/reset-password.html`
- [ ] Paste into Supabase "Change Email Address" template
- [ ] Save

3. [ ] Go to: Authentication → Settings
4. [ ] Update:
   - Sender Name: `Plate Progress`
   - Sender Email: `no-reply@plateprogress.com`
   - Site URL: `https://plateprogress.com`
5. [ ] Save settings

## Step 6: Test Premium Emails (5 minutes)

**Test Trial Welcome Email:**
1. [ ] Sign up for premium trial with test Stripe card
2. [ ] Check email inbox for welcome email
3. [ ] Verify:
   - Email received
   - Branding looks good
   - Links work
   - Trial end date is correct

**Test Subscription Active Email:**
This sends automatically when trial ends (7 days). To test immediately:
1. [ ] Use Stripe Dashboard → Subscriptions
2. [ ] Find test subscription
3. [ ] Click "Actions" → "Update trial"
4. [ ] End trial immediately
5. [ ] Check email for subscription active email

## Step 7: Test Auth Emails (5 minutes)

**Test Signup Confirmation:**
1. [ ] Sign out
2. [ ] Go to `/auth`
3. [ ] Sign up with new email
4. [ ] Check inbox
5. [ ] Verify:
   - Email received
   - Branding looks good
   - Confirmation link works

**Test Password Reset:**
1. [ ] Go to `/auth`
2. [ ] Click "Forgot password"
3. [ ] Enter email
4. [ ] Check inbox
5. [ ] Verify:
   - Email received
   - Reset link works
   - Can set new password

## Step 8: Monitor (Ongoing)

**Resend Dashboard:**
- [ ] Check delivery rate (should be > 95%)
- [ ] Monitor bounces (should be < 5%)
- [ ] Watch for complaints (should be < 0.1%)

**Vercel Logs:**
- [ ] Check for webhook errors
- [ ] Verify email sending logs show success

## Troubleshooting

### Emails not sending?

1. **Check environment variable:**
   ```bash
   # In Vercel Dashboard
   Settings → Environment Variables → RESEND_API_KEY
   ```

2. **Check domain verification:**
   - Resend Dashboard → Domains
   - Status should be "Verified"

3. **Check Vercel logs:**
   ```bash
   vercel logs --follow
   ```
   Look for: `"Welcome email sent to: user@email.com"`

4. **Check Resend Dashboard:**
   - Go to "Emails" tab
   - See if emails are queued/failed

### Emails going to spam?

1. **Verify DNS records:**
   - All 4 DNS records added correctly
   - Wait 24-48 hours for propagation

2. **Test deliverability:**
   - Send test email to yourself
   - Check spam folder
   - Use [mail-tester.com](https://www.mail-tester.com)

3. **Warm up domain:**
   - Start with low volume
   - Gradually increase over 2 weeks

## Rollback Plan

If emails break in production:

1. **Disable webhook emails:**
   ```typescript
   // In app/api/premium/webhook/route.ts
   // Comment out the email sending blocks
   ```

2. **Redeploy:**
   ```bash
   git commit -m "fix: temporarily disable emails"
   git push
   ```

3. **Fix issues** then re-enable

## Success Criteria

✅ All checkboxes ticked above
✅ Trial welcome email received and looks good
✅ Auth emails received and look good  
✅ No errors in Vercel logs
✅ Delivery rate > 95% in Resend Dashboard
✅ Users can confirm signups and reset passwords

## Estimated Time

- **Initial Setup:** 30 minutes
- **Testing:** 15 minutes
- **Total:** ~45 minutes

---

**Questions?** Check `EMAIL_SETUP.md` for detailed troubleshooting!

