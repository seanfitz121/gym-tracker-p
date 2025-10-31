-- Affiliate Shop: Partners, Products, and Click Tracking
-- This migration adds tables for managing affiliate products and tracking clicks

-- ============================================================================
-- AFFILIATE PARTNERS
-- ============================================================================

create table if not exists affiliate_partner (
  id text primary key,
  name text not null,
  origin text not null,  -- e.g., 'Amazon', 'MyProtein'
  website_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_affiliate_partner_origin on affiliate_partner(origin);

-- ============================================================================
-- AFFILIATE PRODUCTS
-- ============================================================================

create table if not exists affiliate_product (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  price_hint text,  -- e.g., "From €29.99"
  origin text not null,
  partner_id text references affiliate_partner(id) on delete set null,
  affiliate_url text not null,
  tags text[] default '{}',
  active boolean default true,
  rating numeric check (rating is null or (rating >= 0 and rating <= 5)),
  description text,
  shipping_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_affiliate_product_active on affiliate_product(active);
create index if not exists idx_affiliate_product_origin on affiliate_product(origin);
create index if not exists idx_affiliate_product_partner on affiliate_product(partner_id);
create index if not exists idx_affiliate_product_tags on affiliate_product using gin(tags);
create index if not exists idx_affiliate_product_created on affiliate_product(created_at desc);

-- ============================================================================
-- AFFILIATE CLICKS (TRACKING)
-- ============================================================================

create table if not exists affiliate_click (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  product_id uuid references affiliate_product(id) on delete cascade,
  partner_id text,
  ip text,  -- Store as text for compatibility
  user_agent text,
  campaign text,
  created_at timestamptz default now()
);

create index if not exists idx_affiliate_click_product on affiliate_click(product_id);
create index if not exists idx_affiliate_click_partner on affiliate_click(partner_id);
create index if not exists idx_affiliate_click_user on affiliate_click(user_id);
create index if not exists idx_affiliate_click_created on affiliate_click(created_at desc);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Affiliate Partner: Public read, admin write
alter table affiliate_partner enable row level security;

create policy "Affiliate partners are publicly readable"
  on affiliate_partner for select
  using (true);

create policy "Only admins can manage partners"
  on affiliate_partner for all
  using (
    exists (
      select 1 from admin_user
      where admin_user.user_id = auth.uid()
    )
  );

-- Affiliate Product: Public read active products, admin write
alter table affiliate_product enable row level security;

create policy "Active affiliate products are publicly readable"
  on affiliate_product for select
  using (active = true);

create policy "Only admins can manage products"
  on affiliate_product for all
  using (
    exists (
      select 1 from admin_user
      where admin_user.user_id = auth.uid()
    )
  );

-- Affiliate Click: Users can read their own clicks, insert for tracking, admin read all
alter table affiliate_click enable row level security;

create policy "Users can view their own clicks"
  on affiliate_click for select
  using (
    auth.uid() = user_id OR
    exists (
      select 1 from admin_user
      where admin_user.user_id = auth.uid()
    )
  );

create policy "Anyone can insert clicks for tracking"
  on affiliate_click for insert
  with check (true);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger for affiliate_partner
create or replace function update_affiliate_partner_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger affiliate_partner_updated_at
  before update on affiliate_partner
  for each row
  execute function update_affiliate_partner_updated_at();

-- Update timestamp trigger for affiliate_product
create or replace function update_affiliate_product_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger affiliate_product_updated_at
  before update on affiliate_product
  for each row
  execute function update_affiliate_product_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================

comment on table affiliate_partner is 'Affiliate partners/merchants';
comment on table affiliate_product is 'Affiliate products available in shop';
comment on table affiliate_click is 'Tracked clicks on affiliate product links';

