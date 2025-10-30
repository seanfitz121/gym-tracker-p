import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { CreatePostInput } from '@/lib/types/community'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreatePostInput = await request.json()
    
    // Validate required fields
    if (!body.category || !body.body) {
      return NextResponse.json(
        { error: 'Category and body are required' },
        { status: 400 }
      )
    }

    // Check rate limit (simplified - check if user_post_limit table exists first)
    try {
      const { data: canPost } = await supabase.rpc('can_user_post', {
        p_user_id: user.id
      })

      if (canPost === false) {
        return NextResponse.json(
          { error: 'Post limit reached. Maximum 10 posts per day.' },
          { status: 429 }
        )
      }
    } catch (rpcError) {
      // RPC function doesn't exist yet - skip rate limiting for now
      console.log('Rate limiting not available yet:', rpcError)
    }

    // Create post
    const { data: post, error } = await supabase
      .from('post')
      .insert({
        user_id: user.id,
        category: body.category,
        title: body.title || '',
        body: body.body,
        media: (body.media || []) as any,
        visibility: body.visibility || 'public',
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting post:', error)
      throw error
    }

    // Increment post count (skip if function doesn't exist)
    try {
      await supabase.rpc('increment_user_post_count', {
        p_user_id: user.id
      })
    } catch (rpcError) {
      console.log('Post count increment not available yet:', rpcError)
    }

    // Fetch the post with author and category info
    const { data: enrichedPost, error: fetchError } = await supabase
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
      `)
      .eq('id', post.id)
      .single()

    if (fetchError) {
      console.error('Error fetching enriched post:', fetchError)
      throw fetchError
    }
    
    // Add rank_code as null for now (will be implemented later)
    if (enrichedPost && enrichedPost.author) {
      (enrichedPost.author as any).rank_code = null
    }

    // Return enriched post with counts
    return NextResponse.json({ 
      post: {
        ...enrichedPost,
        like_count: 0,
        comment_count: 0,
        is_liked_by_user: false
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create post',
        details: error?.message || 'Unknown error',
        hint: error?.hint || 'Check server logs for details'
      },
      { status: 500 }
    )
  }
}

