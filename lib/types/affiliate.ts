export interface AffiliatePartner {
  id: string
  name: string
  origin: string
  website_url?: string | null
  created_at: string
  updated_at: string
}

export interface AffiliateProduct {
  id: string
  title: string
  subtitle?: string | null
  image_url?: string | null
  price_hint?: string | null
  origin: string
  partner_id?: string | null
  partner?: AffiliatePartner | null
  affiliate_url: string
  tags: string[]
  active: boolean
  rating?: number | null
  description?: string | null
  shipping_note?: string | null
  created_at: string
  updated_at: string
}

export interface AffiliateClick {
  id: string
  user_id?: string | null
  product_id: string
  partner_id?: string | null
  ip?: string | null
  user_agent?: string | null
  campaign?: string | null
  created_at: string
}

export interface CreateAffiliateProductInput {
  title: string
  subtitle?: string
  image_url?: string
  price_hint?: string
  origin: string
  partner_id?: string
  affiliate_url: string
  tags?: string[]
  active?: boolean
  rating?: number
  description?: string
  shipping_note?: string
}

export interface UpdateAffiliateProductInput {
  title?: string
  subtitle?: string
  image_url?: string
  price_hint?: string
  origin?: string
  partner_id?: string
  affiliate_url?: string
  tags?: string[]
  active?: boolean
  rating?: number
  description?: string
  shipping_note?: string
}

export interface CreateAffiliatePartnerInput {
  id: string
  name: string
  origin: string
  website_url?: string
}

export interface ProductAnalytics {
  product_id: string
  product_title: string
  total_clicks: number
  unique_users: number
  ctr?: number
  clicks_last_7_days: number
  clicks_last_30_days: number
}

export interface PartnerAnalytics {
  partner_id: string
  partner_name: string
  total_clicks: number
  unique_users: number
  products_count: number
}

