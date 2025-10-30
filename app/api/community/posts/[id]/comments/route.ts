import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { CreateCommentInput } from '@/lib/types/community'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: postId } = await params
    
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id

    // Get all comments for this post
    const { data: comments, error } = await supabase
      .from('comment')
      .select(`
        *,
        author:profile!comment_user_id_fkey(
          id,
          username,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: true })

    if (error) throw error
    
    // Add rank_code as null for all comments
    if (comments) {
      comments.forEach(comment => {
        if (comment.author) {
          (comment.author as any).rank_code = null
        }
      })
    }

    // Enrich comments with counts and user's like status
    const enrichedComments = await Promise.all(
      (comments || []).map(async (comment) => {
        // Get like count
        const { count: likeCount } = await supabase
          .from('reaction')
          .select('*', { count: 'exact', head: true })
          .eq('target_type', 'comment')
          .eq('target_id', comment.id)

        // Check if user liked this comment
        let isLikedByUser = false
        if (userId) {
          const { data: userLike } = await supabase
            .from('reaction')
            .select('id')
            .eq('target_type', 'comment')
            .eq('target_id', comment.id)
            .eq('user_id', userId)
            .maybeSingle()
          
          isLikedByUser = !!userLike
        }

        return {
          ...comment,
          like_count: likeCount || 0,
          is_liked_by_user: isLikedByUser,
        }
      })
    )

    // Organize into threads (parent comments with replies)
    const commentMap = new Map()
    const topLevelComments: any[] = []

    enrichedComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] })
    })

    enrichedComments.forEach(comment => {
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id)
        if (parent) {
          parent.replies.push(commentMap.get(comment.id))
        }
      } else {
        topLevelComments.push(commentMap.get(comment.id))
      }
    })

    return NextResponse.json({ comments: topLevelComments })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: postId } = await params
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateCommentInput = await request.json()

    // Validate
    if (!body.body) {
      return NextResponse.json(
        { error: 'Comment body is required' },
        { status: 400 }
      )
    }

    // Check if post exists and is not locked
    const { data: post } = await supabase
      .from('post')
      .select('is_locked')
      .eq('id', postId)
      .single()

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.is_locked) {
      return NextResponse.json(
        { error: 'This post is locked and cannot receive new comments' },
        { status: 403 }
      )
    }

    // Rate limit: max 1 comment per 10 seconds
    const { data: recentComment } = await supabase
      .from('comment')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 10000).toISOString())
      .maybeSingle()

    if (recentComment) {
      return NextResponse.json(
        { error: 'Please wait before posting another comment' },
        { status: 429 }
      )
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from('comment')
      .insert({
        post_id: postId,
        user_id: user.id,
        body: body.body,
        parent_comment_id: body.parent_comment_id || null,
      })
      .select(`
        *,
        author:profile!comment_user_id_fkey(
          id,
          username,
          avatar_url
        )
      `)
      .single()

    if (error) throw error
    
    // Add rank_code as null
    if (comment && comment.author) {
      (comment.author as any).rank_code = null
    }

    // Update user's last_comment_at
    await supabase
      .from('user_post_limit')
      .upsert({
        user_id: user.id,
        last_comment_at: new Date().toISOString(),
      })

    return NextResponse.json({
      comment: {
        ...comment,
        like_count: 0,
        is_liked_by_user: false,
        replies: []
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}

