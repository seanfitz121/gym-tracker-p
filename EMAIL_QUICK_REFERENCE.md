# Email System Quick Reference 🎯

## 📋 TL;DR

- **Premium emails:** Resend (transactional)
- **Auth emails:** Supabase (signup, reset, magic link)
- **Setup time:** 45 minutes
- **Cost:** $0/month (free tiers)

---

## 🚀 Quick Deploy (5 Steps)

1. **Install packages:**
   ```bash
   npm install
   ```

2. **Get Resend API key:**
   - Sign up at resend.com
   - Add domain + DNS records
   - Create API key

3. **Add to Vercel:**
   ```
   RESEND_API_KEY=re_xxxxx
   ```

4. **Deploy code:**
   ```bash
   git push origin main
   ```

5. **Update Supabase templates:**
   - Copy from `supabase/email-templates/`
   - Paste into Supabase Dashboard

---

## 📧 Email Types

| Email | Trigger | Service | When |
|-------|---------|---------|------|
| **Trial Welcome** | Checkout completed | Resend | User starts 7-day trial |
| **Subscription Active** | Trial → Active | Resend | Trial ends, subscription starts |
| **Signup Confirmation** | User signs up | Supabase | New account created |
| **Password Reset** | User requests | Supabase | Forgot password clicked |
| **Magic Link** | User requests | Supabase | Passwordless login |

---

## 🔧 Files to Know

### For Editing Email Content
```
lib/email/templates/
├── premium-trial-welcome.tsx          ← Edit trial welcome email
└── premium-subscription-active.tsx    ← Edit subscription email

supabase/email-templates/
├── confirm-signup.html                ← Edit signup email
├── magic-link.html                    ← Edit magic link email
└── reset-password.html                ← Edit password reset email
```

### For Sending Logic
```
lib/email/send-premium-emails.ts       ← Email sending functions
app/api/premium/webhook/route.ts       ← When emails are sent
```

---

## 🔑 Environment Variables

Only 1 new variable needed:

```bash
RESEND_API_KEY=re_xxxxx
```

Add to:
- Vercel Dashboard → Settings → Environment Variables
- Local: `.env.local`

---

## 🧪 Testing

### Test Premium Emails
```bash
# 1. Start trial
Go to /app/premium → Start 7-Day Free Trial
Use test card: 4242 4242 4242 4242

# 2. Check email
Inbox → Should see "Welcome to Premium" email

# 3. Check logs
Vercel logs → Look for: "Welcome email sent to: user@email.com"
```

### Test Auth Emails
```bash
# Signup
Sign out → /auth → Create account → Check inbox

# Password reset
/auth → Forgot password → Enter email → Check inbox

# Magic link
Enable in Supabase → /auth → Enter email only → Check inbox
```

---

## 📊 Monitoring

### Resend Dashboard
- **URL:** resend.com/emails
- **Check:** Delivery rate (should be > 95%)
- **Watch:** Bounces (should be < 5%)

### Vercel Logs
```bash
vercel logs --follow
```
Look for:
- ✅ `"Welcome email sent to: user@email.com"`
- ✅ `"Subscription active email sent to: user@email.com"`
- ❌ `"Failed to send premium trial welcome email"`

### Stripe Dashboard
- **URL:** dashboard.stripe.com/webhooks
- **Check:** `checkout.session.completed` returns 200 OK
- **Check:** `customer.subscription.updated` returns 200 OK

---

## ⚠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| **Emails not sending** | Check `RESEND_API_KEY` in Vercel env vars |
| **"Domain not verified"** | Add all 4 DNS records, wait 30 min |
| **Emails in spam** | Verify SPF/DKIM DNS records |
| **Webhook failed** | Check Vercel logs for errors |
| **Wrong email content** | Edit files in `lib/email/templates/` |
| **Auth emails not branded** | Copy HTML to Supabase Dashboard |

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `EMAIL_SETUP.md` | Complete setup guide (read first) |
| `EMAIL_DEPLOYMENT_CHECKLIST.md` | Step-by-step checklist |
| `EMAIL_FEATURES_SUMMARY.md` | What was built & how it works |
| `EMAIL_QUICK_REFERENCE.md` | This file (quick lookup) |

---

## 💰 Costs

### Resend
- **Free:** 3,000 emails/month
- **Pro:** $20/month for 50,000 emails
- **Current usage:** ~50-200/month ✅ Free tier

### Supabase
- **Auth emails:** Unlimited, free

---

## 🎨 Customization

### Change Email Colors
Edit in template files:
```typescript
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
                                     ↑ Purple  ↑ Pink
```

### Change Email Copy
Edit the `<p>` tags in template files:
```tsx
<p>Hey {displayName},</p>
<p>Your custom message here...</p>
```

### Add New Email
1. Create template in `lib/email/templates/your-email.tsx`
2. Add send function in `lib/email/send-premium-emails.ts`
3. Call function where needed

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Trial signup sends welcome email
- [ ] Welcome email looks branded (purple header)
- [ ] Trial end date is correct (7 days from now)
- [ ] Signup sends confirmation email
- [ ] Confirmation email looks branded
- [ ] Password reset sends email
- [ ] Reset link works
- [ ] No errors in Vercel logs
- [ ] Resend shows > 95% delivery rate
- [ ] Stripe webhooks return 200 OK

---

## 🆘 Emergency Contacts

**Resend not working:**
- Docs: resend.com/docs
- Support: resend.com/support

**Supabase not working:**
- Docs: supabase.com/docs/guides/auth
- Discord: discord.supabase.com

**Code issues:**
- Check: EMAIL_SETUP.md troubleshooting
- Email: support@plateprogress.com

---

**Last Updated:** October 29, 2024  
**Status:** ✅ Ready for deployment

