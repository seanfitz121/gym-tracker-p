import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { UpdatePostInput } from '@/lib/types/community'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id

    // Get post with author info, counts, and user's like status
    const { data: post, error } = await supabase
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
      .eq('id', id)
      .single()

    if (error) throw error
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Add rank_code as null for now (will be implemented later)
    if (post.author) {
      (post.author as any).rank_code = null
    }

    // Get like count
    const { count: likeCount } = await supabase
      .from('reaction')
      .select('*', { count: 'exact', head: true })
      .eq('target_type', 'post')
      .eq('target_id', id)

    // Get comment count
    const { count: commentCount } = await supabase
      .from('comment')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', id)
      .eq('is_hidden', false)

    // Check if user liked this post
    let isLikedByUser = false
    if (userId) {
      const { data: userLike } = await supabase
        .from('reaction')
        .select('id')
        .eq('target_type', 'post')
        .eq('target_id', id)
        .eq('user_id', userId)
        .maybeSingle()
      
      isLikedByUser = !!userLike
    }

    return NextResponse.json({
      post: {
        ...post,
        like_count: likeCount || 0,
        comment_count: commentCount || 0,
        is_liked_by_user: isLikedByUser,
      }
    })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: UpdatePostInput = await request.json()

    // Check ownership
    const { data: existingPost } = await supabase
      .from('post')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existingPost || existingPost.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update post
    const { data: post, error } = await supabase
      .from('post')
      .update({
        ...body,
        media: body.media as any, // Cast media to match Json type
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check ownership or admin
    const { data: existingPost } = await supabase
      .from('post')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const { data: isAdmin } = await supabase
      .from('admin_user')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingPost.user_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete post (cascades to comments, reactions, etc.)
    const { error } = await supabase
      .from('post')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}

