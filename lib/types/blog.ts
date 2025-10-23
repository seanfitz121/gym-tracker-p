export interface BlogPost {
  id: string
  author_id: string
  title: string
  subtitle: string | null
  cover_image_url: string | null
  body: string
  published: boolean
  created_at: string
  updated_at: string
  author?: {
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

