# Premium Trial Fix - Deployment Guide 🚀

## What Was Fixed

**File Changed**: `app/api/premium/webhook/route.ts`

**Issue**: Webhook was hardcoding subscription status as `'active'` instead of using Stripe's actual status (`'trialing'` for trials).

**Fix**: Now properly maps Stripe subscription statuses to database values.

## Quick Deployment Steps

### 1. Deploy to Production

```bash
# Commit and push
git add .
git commit -m "fix: properly map Stripe subscription status for trial users"
git push origin main
```

Vercel will auto-deploy.

### 2. Fix Affected User Immediately

Get the user's ID from their email, then run this in Supabase SQL Editor:

```sql
-- Replace 'USER_EMAIL_HERE' with actual email
SELECT ps.user_id, ps.status, ps.stripe_subscription_id
FROM premium_subscription ps
JOIN auth.users u ON u.id = ps.user_id
WHERE u.email = 'USER_EMAIL_HERE';

-- Copy the user_id from results, then run:
UPDATE premium_subscription
SET status = 'trialing'
WHERE user_id = 'PASTE_USER_ID_HERE';
```

The user should immediately see premium features work (may need to refresh page).

### 3. Verify Fix Works

**Option A: Check in Database**
```sql
-- Should show status = 'trialing' and is_premium = true
SELECT 
  p.display_name,
  p.email,
  p.is_premium,
  ps.status,
  ps.current_period_end
FROM profile p
JOIN premium_subscription ps ON ps.user_id = p.id
WHERE p.email = 'USER_EMAIL_HERE';
```

**Option B: Ask User to Check**
Tell them to:
1. Refresh `/app/premium` page
2. Should see "Premium Active" card with status "trialing"
3. Should see "Manage Subscription" button
4. Try accessing `/app/weight` or `/app/hydration` (should work)
5. Check for golden username in settings (if enabled)

### 4. Test with New Trial Signup (Optional)

1. Create test account
2. Go to `/app/premium`
3. Start 7-day trial
4. After Stripe redirect, verify:
   - Premium features accessible
   - Status shows "trialing"
   - "Manage Subscription" button appears

## What to Monitor

### Vercel Logs
Look for: `"Subscription created for user: [ID] with status: trialing"`

### Stripe Dashboard
1. Go to Developers → Webhooks
2. Check recent webhook deliveries
3. Look for `checkout.session.completed` events
4. Verify they're returning 200 OK

## Files Included

1. **PREMIUM_TRIAL_FIX.md** - Full technical documentation
2. **fix_trial_subscription.sql** - SQL queries to identify and fix affected users
3. **This file** - Quick deployment guide

## Expected Timeline

- **Deploy**: ~2 minutes (auto via Vercel)
- **Database fix**: ~30 seconds
- **User sees fix**: Immediate (on page refresh)

## Verification Checklist

- [ ] Code deployed to production
- [ ] Affected user's subscription fixed in database
- [ ] User confirms premium features work
- [ ] User sees golden flair (if enabled)
- [ ] User can access weight/hydration trackers
- [ ] "Manage Subscription" button appears

## If Something Doesn't Work

1. **Check Vercel deployment logs** for errors
2. **Check Stripe webhook logs** - webhooks might be failing
3. **Check Supabase logs** - database errors
4. **Verify env vars** are set correctly (STRIPE_WEBHOOK_SECRET, etc.)

## Support Commands

```sql
-- See all premium users
SELECT p.email, ps.status, ps.current_period_end
FROM profile p
JOIN premium_subscription ps ON ps.user_id = p.id
WHERE ps.status IN ('active', 'trialing')
ORDER BY ps.created_at DESC;

-- Check specific user
SELECT *
FROM premium_subscription ps
JOIN auth.users u ON u.id = ps.user_id
WHERE u.email = 'email@example.com';

-- Force refresh premium status
UPDATE profile p
SET is_premium = (
  SELECT ps.status IN ('active', 'trialing')
  FROM premium_subscription ps
  WHERE ps.user_id = p.id
)
WHERE p.email = 'email@example.com';
```

---

**Need Help?** Check `PREMIUM_TRIAL_FIX.md` for detailed troubleshooting.

