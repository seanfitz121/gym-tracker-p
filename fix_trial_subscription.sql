-- SQL Script to Fix Premium Trial Subscription Issues
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Identify affected subscriptions
-- ============================================
-- Find subscriptions that might have been created during the bug period
-- These will have status 'active' but might actually be trials

SELECT 
  ps.id as subscription_id,
  ps.user_id,
  ps.status as current_status,
  ps.stripe_subscription_id,
  ps.current_period_start,
  ps.current_period_end,
  ps.created_at,
  p.display_name,
  p.email
FROM premium_subscription ps
LEFT JOIN profile p ON p.user_id = ps.user_id
WHERE ps.status = 'active'
  AND ps.created_at >= '2024-10-29'  -- Adjust this date
ORDER BY ps.created_at DESC;

-- ============================================
-- STEP 2: Fix specific user's subscription
-- ============================================
-- Replace 'USER_ID_HERE' with the actual user ID

-- Option A: Set to 'trialing' if they're in a trial period
UPDATE premium_subscription
SET status = 'trialing'
WHERE user_id = 'USER_ID_HERE'
  AND status = 'active'
  AND current_period_end > NOW()
  AND current_period_start > NOW() - INTERVAL '7 days';

-- Option B: If you know from Stripe they should be 'trialing'
UPDATE premium_subscription
SET status = 'trialing'
WHERE stripe_subscription_id = 'STRIPE_SUB_ID_HERE';

-- ============================================
-- STEP 3: Verify the fix
-- ============================================
-- Check the subscription was updated correctly

SELECT 
  ps.user_id,
  ps.status,
  ps.stripe_subscription_id,
  ps.current_period_start,
  ps.current_period_end,
  ps.cancel_at_period_end,
  p.display_name,
  p.email,
  p.is_premium,
  p.premium_flair_enabled
FROM premium_subscription ps
LEFT JOIN profile p ON p.user_id = ps.user_id
WHERE ps.user_id = 'USER_ID_HERE';

-- ============================================
-- STEP 4: Sync is_premium flag in profile
-- ============================================
-- Ensure profile.is_premium reflects subscription status
-- This should happen automatically via trigger, but just in case:

UPDATE profile
SET is_premium = TRUE
WHERE user_id IN (
  SELECT user_id 
  FROM premium_subscription 
  WHERE status IN ('active', 'trialing')
);

-- ============================================
-- STEP 5: List all current premium users
-- ============================================
-- See all users with active premium

SELECT 
  p.display_name,
  p.email,
  ps.status,
  ps.current_period_end,
  ps.cancel_at_period_end,
  CASE 
    WHEN ps.status = 'trialing' THEN 'Trial (' || EXTRACT(DAY FROM ps.current_period_end - NOW()) || ' days left)'
    WHEN ps.status = 'active' THEN 'Active'
    ELSE ps.status
  END as status_display
FROM profile p
INNER JOIN premium_subscription ps ON ps.user_id = p.user_id
WHERE ps.status IN ('active', 'trialing')
ORDER BY ps.created_at DESC;

-- ============================================
-- Notes:
-- ============================================
-- - The webhook fix prevents this issue for new signups
-- - This script fixes existing affected subscriptions
-- - Always verify the subscription status in Stripe Dashboard first
-- - The user's frontend will update automatically via realtime subscription

