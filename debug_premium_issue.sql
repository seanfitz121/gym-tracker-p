-- Debug Premium Issue - Run these queries step by step
-- Replace 'USER_EMAIL_HERE' with the actual user's email

-- ============================================
-- STEP 1: Find the user and check their auth record
-- ============================================
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
WHERE email = 'USER_EMAIL_HERE';
-- Copy the user_id for next steps

-- ============================================
-- STEP 2: Check if subscription record exists
-- ============================================
SELECT 
  id,
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  status,
  current_period_start,
  current_period_end,
  created_at,
  updated_at
FROM premium_subscription
WHERE user_id = 'PASTE_USER_ID_HERE';

-- If NO ROWS RETURNED: The webhook never created the subscription!
-- This means either:
-- a) Webhook didn't fire
-- b) Webhook failed
-- c) User never completed checkout

-- ============================================
-- STEP 3: Check profile record
-- ============================================
SELECT 
  id,
  user_id,
  display_name,
  email,
  is_premium,
  premium_flair_enabled,
  created_at
FROM profile
WHERE user_id = 'PASTE_USER_ID_HERE';

-- If is_premium is FALSE, the trigger didn't sync!

-- ============================================
-- STEP 4: Check if profile record even exists
-- ============================================
SELECT COUNT(*) as profile_exists
FROM profile
WHERE user_id = 'PASTE_USER_ID_HERE';

-- If 0, the user has no profile! This is a bigger issue.

-- ============================================
-- STEP 5: Manual fix - Create subscription if missing
-- ============================================
-- ONLY RUN THIS if Step 2 showed NO subscription record
-- You'll need the Stripe subscription ID from Stripe Dashboard

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
  'PASTE_USER_ID_HERE',
  'STRIPE_CUSTOMER_ID_FROM_DASHBOARD', -- e.g., cus_xxxxx
  'STRIPE_SUBSCRIPTION_ID_FROM_DASHBOARD', -- e.g., sub_xxxxx
  'STRIPE_PRICE_ID', -- Your price ID from env vars
  'trialing',
  NOW(), -- Or actual start date from Stripe
  NOW() + INTERVAL '7 days', -- Or actual end date from Stripe
  false
);

-- ============================================
-- STEP 6: Manual fix - Create profile if missing
-- ============================================
-- ONLY RUN THIS if Step 4 showed 0 profiles

INSERT INTO profile (user_id, display_name, email, is_premium, premium_flair_enabled)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'display_name', email_confirmed_at::text, email),
  email,
  true,
  true
FROM auth.users
WHERE id = 'PASTE_USER_ID_HERE';

-- ============================================
-- STEP 7: Force sync is_premium flag
-- ============================================
-- Run this regardless to ensure profile is synced

UPDATE profile
SET is_premium = true
WHERE user_id = 'PASTE_USER_ID_HERE';

-- ============================================
-- STEP 8: Verify everything is correct now
-- ============================================
SELECT 
  p.display_name,
  p.email,
  p.is_premium,
  p.premium_flair_enabled,
  ps.status as subscription_status,
  ps.stripe_subscription_id,
  ps.current_period_end,
  CASE 
    WHEN ps.status IN ('active', 'trialing') THEN '✅ Should have premium'
    ELSE '❌ Will not have premium'
  END as expected_result
FROM profile p
LEFT JOIN premium_subscription ps ON ps.user_id = p.user_id
WHERE p.user_id = 'PASTE_USER_ID_HERE';

-- ============================================
-- STEP 9: Check in Stripe Dashboard
-- ============================================
-- Go to: https://dashboard.stripe.com/customers
-- Search for user's email
-- Check:
-- 1. Does customer exist?
-- 2. Does subscription exist?
-- 3. What's the subscription status?
-- 4. What's the trial end date?

-- ============================================
-- STEP 10: Check webhook delivery in Stripe
-- ============================================
-- Go to: https://dashboard.stripe.com/webhooks
-- Click on your webhook endpoint
-- Look for recent 'checkout.session.completed' events
-- Check:
-- 1. Did it send?
-- 2. What was the response code?
-- 3. Any errors in the response?

