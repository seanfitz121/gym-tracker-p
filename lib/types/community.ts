// Community Feed Types

export interface CommunityCategory {
  code: string
  name: string
  description: string | null
  icon: string | null
  display_order: number
  created_at: string
}

export interface Post {
  id: string
  user_id: string
  category: string
  title: string | null
  body: string
  media: PostMedia[]
  visibility: 'public' | 'friends'
  is_pinned: boolean
  is_locked: boolean
  is_hidden: boolean
  view_count: number
  created_at: string
  updated_at: string
}

export interface PostMedia {
  url: string
  type: 'image' | 'video' | 'gif'
  alt?: string
  thumbnail?: string
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  parent_comment_id: string | null
  body: string
  is_hidden: boolean
  created_at: string
  updated_at: string
}

export interface Reaction {
  id: string
  target_type: 'post' | 'comment'
  target_id: string
  user_id: string
  kind: 'like'
  created_at: string
}

export interface PostView {
  id: string
  post_id: string
  user_id: string | null
  ip_address: string | null
  viewed_at: string
}

export interface CommunityReport {
  id: string
  reporter_id: string
  target_type: 'post' | 'comment'
  target_id: string
  reason: string
  details: string | null
  status: 'open' | 'reviewed' | 'dismissed' | 'actioned'
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export interface UserPostLimit {
  user_id: string
  posts_today: number
  last_post_at: string | null
  last_comment_at: string | null
  is_limited: boolean
  updated_at: string
}

// Extended types with relations for UI
export interface PostWithAuthor extends Post {
  author: {
    id: string
    username: string
    avatar_url: string | null
    rank_code: string | null
    is_premium: boolean
  }
  category_info: CommunityCategory
  like_count: number
  comment_count: number
  is_liked_by_user: boolean
}

export interface CommentWithAuthor extends Comment {
  author: {
    id: string
    username: string
    avatar_url: string | null
    rank_code: string | null
  }
  like_count: number
  is_liked_by_user: boolean
  replies?: CommentWithAuthor[]
}

export interface PostWithDetails extends PostWithAuthor {
  comments: CommentWithAuthor[]
}

// Input types for creating/updating
export interface CreatePostInput {
  category: string
  title?: string
  body: string
  media?: PostMedia[]
  visibility?: 'public' | 'friends'
}

export interface UpdatePostInput {
  title?: string
  body?: string
  media?: PostMedia[]
  visibility?: 'public' | 'friends'
}

export interface CreateCommentInput {
  post_id: string
  body: string
  parent_comment_id?: string
}

export interface CreateReactionInput {
  target_type: 'post' | 'comment'
  target_id: string
  kind: 'like'
}

export interface CreateReportInput {
  target_type: 'post' | 'comment'
  target_id: string
  reason: string
  details?: string
}

// Feed query params
export interface FeedParams {
  type?: 'global' | 'category' | 'friends'
  category?: string
  page?: number
  limit?: number
  user_id?: string
}

// Moderation queue item
export interface ModerationQueueItem {
  report: CommunityReport
  target: Post | Comment | null
  reporter: {
    id: string
    username: string
  }
  target_author?: {
    id: string
    username: string
  }
}

// Rate limiting response
export interface PostLimitStatus {
  can_post: boolean
  posts_today: number
  posts_remaining: number
  time_until_reset?: string
}

