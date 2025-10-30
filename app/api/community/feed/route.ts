import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const type = searchParams.get('type') || 'global'
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id

    // Base query
    let query = supabase
      .from('post')
      .select(`
        *,
        author:profile!post_user_id_fkey(
          id,
          username,
          avatar_url,
          is_premium
        ),
        category_info:community_category!post_category_fkey(*)
      `, { count: 'exact' })
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })

    // Apply filters based on feed type
    if (type === 'category' && category) {
      query = query.eq('category', category)
    } else if (type === 'friends' && userId) {
      // Get user's friends from the friend table (bidirectional)
      const { data: friendships } = await supabase
        .from('friend')
        .select('user_id, friend_id')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)

      const friendIds = friendships?.map(f => 
        f.user_id === userId ? f.friend_id : f.user_id
      ) || []
      
      if (friendIds.length > 0) {
        query = query.in('user_id', friendIds)
      } else {
        // No friends, return empty
        return NextResponse.json({
          posts: [],
          total: 0,
          page,
          limit,
          hasMore: false
        })
      }
    }

    // Apply visibility filter (if not logged in, only public posts)
    if (!userId) {
      query = query.eq('visibility', 'public')
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data: posts, error, count } = await query

    if (error) throw error

    // Enrich posts with counts and user's like status
    const enrichedPosts = await Promise.all(
      (posts || []).map(async (post) => {
        // Get like count
        const { count: likeCount } = await supabase
          .from('reaction')
          .select('*', { count: 'exact', head: true })
          .eq('target_type', 'post')
          .eq('target_id', post.id)

        // Get comment count
        const { count: commentCount } = await supabase
          .from('comment')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id)
          .eq('is_hidden', false)

        // Check if user liked this post
        let isLikedByUser = false
        if (userId) {
          const { data: userLike } = await supabase
            .from('reaction')
            .select('id')
            .eq('target_type', 'post')
            .eq('target_id', post.id)
            .eq('user_id', userId)
            .maybeSingle()
          
          isLikedByUser = !!userLike
        }

        // Add rank_code as null for now (will be implemented later)
        if (post.author) {
          (post.author as any).rank_code = null
        }

        return {
          ...post,
          like_count: likeCount || 0,
          comment_count: commentCount || 0,
          is_liked_by_user: isLikedByUser,
        }
      })
    )

    return NextResponse.json({
      posts: enrichedPosts,
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit
    })
  } catch (error) {
    console.error('Error fetching feed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    )
  }
}

