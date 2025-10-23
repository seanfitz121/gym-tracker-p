-- Premium Subscriptions Migration
-- Stores Stripe customer IDs and subscription status

-- Create premium_subscription table
CREATE TABLE IF NOT EXISTS public.premium_subscription (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  stripe_price_id text,
  status text NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'canceled', 'past_due', 'trialing')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.premium_subscription ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
  ON public.premium_subscription
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update subscriptions (via Stripe webhook)
CREATE POLICY "Service role can insert subscriptions"
  ON public.premium_subscription
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update subscriptions"
  ON public.premium_subscription
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_premium_subscription_user_id ON public.premium_subscription(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_subscription_stripe_customer_id ON public.premium_subscription(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_premium_subscription_stripe_subscription_id ON public.premium_subscription(stripe_subscription_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_premium_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER premium_subscription_updated_at
  BEFORE UPDATE ON public.premium_subscription
  FOR EACH ROW
  EXECUTE FUNCTION update_premium_subscription_updated_at();

-- Grant permissions
GRANT SELECT ON public.premium_subscription TO authenticated;
GRANT ALL ON public.premium_subscription TO service_role;

