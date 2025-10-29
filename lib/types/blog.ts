export interface BlogPost {
  id: string
  author_id: string
  title: string
  subtitle: string | null
  cover_image_url: string | null
  body: string
  published: boolean | null
  created_at: string | null
  updated_at: string | null
  slug?: string | null
  author?: {
    id?: string
    display_name: string | null
    avatar_url: string | null
  }
}

export interface CreateBlogPostInput {
  title: string
  subtitle?: string
  cover_image_url?: string
  body: string
  published: boolean
}

export interface UpdateBlogPostInput {
  title?: string
  subtitle?: string
  cover_image_url?: string
  body?: string
  published?: boolean
}

