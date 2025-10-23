# Stripe Premium Subscription Setup Guide

This guide walks you through setting up Stripe for the Premium subscription feature.

## Prerequisites

- A Stripe account ([sign up here](https://dashboard.stripe.com/register))
- Access to your Supabase project
- Admin access to your Vercel deployment

## Step 1: Database Migration

Run the premium subscription migration in Supabase SQL Editor:

```sql
-- Located in: supabase/migrations/add_premium_subscriptions.sql
-- Copy and paste the entire file into Supabase SQL Editor and execute
```

This creates the `premium_subscription` table with RLS policies.

## Step 2: Create Stripe Product & Price

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** > **Add Product**
3. Fill in details:
   - **Name**: Plate Progress Premium
   - **Description**: Premium features for Plate Progress
   - **Pricing**: Recurring
   - **Amount**: €4.00
   - **Billing period**: Monthly
4. Click **Save product**
5. **Copy the Price ID** (starts with `price_...`)

## Step 3: Get Your Stripe API Keys

### Test Mode (Development)

1. In Stripe Dashboard, click **Developers** > **API keys**
2. Find **Publishable key** (starts with `pk_test_...`)
3. Find **Secret key** (starts with `sk_test_...`)
4. Click **Reveal test key** to copy

### Live Mode (Production)

1. Toggle to **Live mode** in top-right corner
2. Repeat the same steps for live keys (`pk_live_...` and `sk_live_...`)

## Step 4: Create Webhook Endpoint

1. In Stripe Dashboard, go to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Enter endpoint URL:
   - **Development**: `http://localhost:3000/api/premium/webhook`
   - **Production**: `https://plateprogress.com/api/premium/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. **Copy the Signing secret** (starts with `whsec_...`)

## Step 5: Add Environment Variables

### Local Development (.env.local)

```bash
# Stripe Keys (Test Mode)
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
STRIPE_PRICE_ID=price_YOUR_PRICE_ID

# Supabase Service Role Key (for webhook)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Already set
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Production (Vercel)

1. Go to your Vercel project
2. Navigate to **Settings** > **Environment Variables**
3. Add the following variables:

| Name | Value | Environment |
|------|-------|------------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | Production |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Production |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Production |
| `STRIPE_PRICE_ID` | `price_...` | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | Production |

4. Click **Save** for each

## Step 6: Get Supabase Service Role Key

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** > **API**
4. Under **Project API keys**, copy the **service_role** key
5. Add it to your environment variables

**⚠️ IMPORTANT**: The service role key bypasses RLS. Never expose it to the client!

## Step 7: Test the Integration

### Local Testing

1. Start your dev server: `npm run dev`
2. Navigate to `http://localhost:3000/app/premium`
3. Click **Upgrade to Premium**
4. Use Stripe test card:
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
5. Complete the checkout
6. Verify redirect to success page
7. Check Supabase `premium_subscription` table for new record

### Test Webhook Locally (Optional)

Use the Stripe CLI to forward webhooks to localhost:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/premium/webhook

# Use the webhook signing secret from CLI output
```

### Production Testing

1. Deploy to Vercel with all environment variables set
2. In Stripe Dashboard, toggle to **Live mode**
3. Test with a real card (you can cancel immediately after)
4. Verify subscription appears in database

## Step 8: Enable Customer Portal

The customer portal allows users to manage their subscription.

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/settings/billing/portal)
2. Click **Settings** > **Billing** > **Customer portal**
3. Configure:
   - **Branding**: Add your logo and colors
   - **Features**: Enable "Cancel subscription"
   - **Business information**: Add support email
4. Click **Save changes**

**Note**: Premium members will see a "Manage Subscription" button on `/app/premium` that links directly to your Stripe billing portal at: `https://billing.stripe.com/p/login/eVq00k1Bdb2b1gu91jgUM00`

## Troubleshooting

### Webhook not receiving events

- Check webhook URL is correct
- Verify webhook is in correct mode (test/live)
- Check Vercel logs for errors
- Ensure `STRIPE_WEBHOOK_SECRET` matches the endpoint

### Subscription not appearing in database

- Check Supabase logs
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check `premium_subscription` table has correct schema
- Look for webhook errors in Stripe Dashboard

### Checkout session not creating

- Verify `STRIPE_PRICE_ID` is correct
- Check Stripe API key is for correct mode
- Look for errors in browser console and server logs

## Testing Subscription Lifecycle

### Test Different Statuses

Use Stripe test clocks to simulate:

1. **Active subscription**: Normal checkout
2. **Canceled subscription**: Cancel in customer portal
3. **Past due**: Use test card `4000 0000 0000 0341` (requires authentication)
4. **Trial**: Set up a trial period on your price

### Verify Status Updates

After each action:
1. Check webhook received in Stripe Dashboard
2. Verify database updated correctly
3. Confirm UI reflects status change

## Going Live Checklist

- [ ] Switch Stripe keys to Live mode
- [ ] Update webhook endpoint to production URL
- [ ] Test live checkout with real card
- [ ] Verify webhook receives live events
- [ ] Test customer portal functionality
- [ ] Set up email notifications in Stripe
- [ ] Configure tax settings if applicable
- [ ] Set up proper business information
- [ ] Test subscription cancellation flow

## Pricing & Billing

Current setup: **€4/month recurring**

To change pricing:
1. Create new price in Stripe Dashboard
2. Update `STRIPE_PRICE_ID` environment variable
3. Redeploy application

## Support & Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

## Security Notes

- Never commit Stripe secret keys to git
- Service role key should only be used server-side
- Always verify webhook signatures
- Use environment variables for all secrets
- Enable webhook signature verification
- Test RLS policies thoroughly

---

**Need help?** Contact support@plateprogress.com

