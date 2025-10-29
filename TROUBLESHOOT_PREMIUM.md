# Premium Not Working - Troubleshooting Guide 🔍

## Issue
User signed up for trial, webhook fix deployed, SQL script ran, but user **still doesn't have premium**.

## Diagnostic Steps

### Step 1: Run Debug Script
Use `debug_premium_issue.sql` to check:
1. Does the user exist?
2. Does a subscription record exist?
3. Does a profile record exist?
4. What's the `is_premium` value?

### Step 2: Check Stripe Dashboard

**Go to**: [Stripe Customers](https://dashboard.stripe.com/customers)

1. Search for the user's email
2. Check if customer exists
3. Check if subscription exists
4. Note the subscription ID (`sub_xxxxx`)
5. Check subscription status (should be "Trialing")

### Step 3: Check Webhook Delivery

**Go to**: [Stripe Webhooks](https://dashboard.stripe.com/webhooks)

1. Click your webhook endpoint
2. Look for `checkout.session.completed` event for this user
3. Check response code:
   - **200**: Webhook succeeded
   - **400/500**: Webhook failed (check error message)
   - **Not sent**: Webhook never fired

## Common Issues & Fixes

### Issue 1: Subscription Record Doesn't Exist
**Symptom**: Query in Step 2 of debug script returns 0 rows

**Cause**: Webhook never created the record (failed or didn't fire)

**Fix**: Manually create the subscription record using Stripe data

```sql
-- Get data from Stripe Dashboard first!
INSERT INTO premium_subscription (
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  stripe_price_id,
  status,
  current_period_start,
  current_period_end,
  cancel_at_period_end
)
VALUES (
  'USER_ID_FROM_STEP_1',
  'cus_XXXXX', -- From Stripe
  'sub_XXXXX', -- From Stripe
  'price_XXXXX', -- Your Stripe price ID
  'trialing',
  '2024-10-29 12:00:00+00', -- From Stripe
  '2024-11-05 12:00:00+00', -- From Stripe (trial end)
  false
);
```

### Issue 2: Profile Record Doesn't Exist
**Symptom**: Query in Step 4 returns 0 rows

**Cause**: Profile was never created (signup flow issue)

**Fix**: Create profile manually

```sql
INSERT INTO profile (user_id, display_name, email, is_premium, premium_flair_enabled)
SELECT 
  id,
  SPLIT_PART(email, '@', 1), -- Use email username as display name
  email,
  true,
  true
FROM auth.users
WHERE id = 'USER_ID_HERE';
```

### Issue 3: is_premium Flag Not Synced
**Symptom**: Subscription exists, profile exists, but `is_premium = false`

**Cause**: Trigger didn't fire or failed

**Fix**: Manually update the flag

```sql
UPDATE profile
SET is_premium = true
WHERE user_id = 'USER_ID_HERE';
```

### Issue 4: Frontend Caching
**Symptom**: Database shows everything correct, but frontend still shows no premium

**Fix**: Tell user to:
1. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Log out and log back in
4. Try in incognito/private window

### Issue 5: Webhook Failed
**Symptom**: Stripe shows webhook sent but got 400/500 error

**Possible Causes**:
- Stripe webhook secret mismatch
- Database RLS policy blocking service role
- Missing environment variables

**Fix**: Check Vercel logs for webhook errors:
```bash
vercel logs --follow
```

Look for errors like:
- "Webhook secret not configured"
- "No user ID in session metadata"
- "Failed to create subscription"

## Quick Verification Query

Run this to see everything at once:

```sql
-- Replace email
WITH user_data AS (
  SELECT id, email FROM auth.users WHERE email = 'USER_EMAIL_HERE'
)
SELECT 
  u.email,
  u.id as user_id,
  CASE WHEN p.id IS NULL THEN '❌ MISSING' ELSE '✅ EXISTS' END as profile_exists,
  CASE WHEN ps.id IS NULL THEN '❌ MISSING' ELSE '✅ EXISTS' END as subscription_exists,
  p.is_premium,
  p.premium_flair_enabled,
  ps.status as subscription_status,
  ps.stripe_subscription_id,
  ps.current_period_end,
  CASE 
    WHEN p.id IS NULL THEN 'Create profile'
    WHEN ps.id IS NULL THEN 'Create subscription'
    WHEN p.is_premium = false THEN 'Update is_premium flag'
    WHEN ps.status NOT IN ('active', 'trialing') THEN 'Fix subscription status'
    ELSE '✅ Everything looks good - try frontend refresh'
  END as action_needed
FROM user_data u
LEFT JOIN profile p ON p.user_id = u.id
LEFT JOIN premium_subscription ps ON ps.user_id = u.id;
```

## Expected Results After Fix

When everything is working:
- ✅ `profile.is_premium` = `true`
- ✅ `premium_subscription.status` = `'trialing'`
- ✅ Stripe shows active trial
- ✅ User sees "Premium Active" on `/app/premium`
- ✅ User can access `/app/weight` and `/app/hydration`
- ✅ "Manage Subscription" button appears
- ✅ Golden username shows (if flair enabled)

## Still Not Working?

### Check These:

1. **Environment Variables** (Vercel Dashboard)
   - `STRIPE_SECRET_KEY` - Set correctly?
   - `STRIPE_WEBHOOK_SECRET` - Matches Stripe?
   - `STRIPE_PRICE_ID` - Correct price?
   - `NEXT_PUBLIC_SITE_URL` - Correct URL?
   - `SUPABASE_SERVICE_ROLE_KEY` - Set correctly?

2. **RLS Policies** (Supabase Dashboard)
   ```sql
   -- Check service role can insert
   SELECT * FROM pg_policies WHERE tablename = 'premium_subscription';
   ```

3. **Webhook Endpoint** (Stripe Dashboard)
   - URL correct? (https://yoursite.com/api/premium/webhook)
   - Events selected: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Webhook signing secret copied to Vercel?

4. **Frontend Hook** (`lib/hooks/use-premium.ts`)
   - Check browser console for errors
   - Check Network tab for API calls failing

## Nuclear Option: Start Fresh

If nothing works, have the user:
1. Cancel subscription in Stripe portal
2. Delete records:
   ```sql
   DELETE FROM premium_subscription WHERE user_id = 'USER_ID';
   UPDATE profile SET is_premium = false WHERE user_id = 'USER_ID';
   ```
3. Try signing up for trial again (with fixed webhook code)

---

**Need the actual error?** Share:
- Vercel webhook logs
- Stripe webhook delivery logs
- Results from the debug SQL queries

