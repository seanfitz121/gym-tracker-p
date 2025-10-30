'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Heart, MessageCircle, Eye, MoreVertical, Flag, Trash2, Edit, Lock, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CommentItem } from './comment-item'
import type { PostWithAuthor, CommentWithAuthor } from '@/lib/types/community'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface PostDetailPageProps {
  postId: string
}

export function PostDetailPage({ postId }: PostDetailPageProps) {
  const router = useRouter()
  const [post, setPost] = useState<PostWithAuthor | null>(null)
  const [comments, setComments] = useState<CommentWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    fetchUser()
  }, [])

  // Fetch post
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/community/posts/${postId}`)
        const data = await res.json()
        
        if (res.ok && data.post) {
          setPost(data.post)
          setIsLiked(data.post.is_liked_by_user)
          setLikeCount(data.post.like_count)
        } else {
          toast.error('Post not found')
          router.push('/app/community')
        }
      } catch (error) {
        console.error('Error fetching post:', error)
        toast.error('Failed to load post')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [postId, router])

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/community/posts/${postId}/comments`)
        const data = await res.json()
        
        if (res.ok) {
          setComments(data.comments || [])
        }
      } catch (error) {
        console.error('Error fetching comments:', error)
      }
    }

    fetchComments()
  }, [postId])

  const handleLike = async () => {
    // Optimistic update
    setIsLiked(!isLiked)
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1)

    try {
      const res = await fetch('/api/community/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: 'post',
          target_id: postId,
          kind: 'like'
        })
      })

      if (!res.ok) {
        // Revert on error
        setIsLiked(isLiked)
        setLikeCount(prev => isLiked ? prev + 1 : prev - 1)
        toast.error('Failed to like post')
      }
    } catch (error) {
      // Revert on error
      setIsLiked(isLiked)
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1)
      toast.error('Failed to like post')
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim()) return

    setIsSubmittingComment(true)

    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newComment })
      })

      const data = await res.json()

      if (res.ok) {
        setComments(prev => [...prev, data.comment])
        setNewComment('')
        toast.success('Comment posted')
      } else {
        toast.error(data.error || 'Failed to post comment')
      }
    } catch (error) {
      toast.error('Failed to post comment')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const res = await fetch(`/api/community/posts/${postId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('Post deleted')
        router.push('/app/community')
      } else {
        toast.error('Failed to delete post')
      }
    } catch (error) {
      toast.error('Failed to delete post')
    }
  }

  const handleReport = async () => {
    try {
      const res = await fetch('/api/community/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: 'post',
          target_id: postId,
          reason: 'User reported this post'
        })
      })

      const data = await res.json()
      
      if (res.ok) {
        toast.success(data.message)
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Failed to report post')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Loading post...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return null
  }

  const isOwner = currentUserId === post.user_id

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Post Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.author.avatar_url || undefined} />
                  <AvatarFallback>
                    {post.author.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{post.author.username}</span>
                    {post.author.rank_code && (
                      <Badge variant="secondary">{post.author.rank_code}</Badge>
                    )}
                    {post.author.is_premium && (
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                        Pro
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                    <span>•</span>
                    <Badge variant="outline">
                      {post.category_info.icon} {post.category_info.name}
                    </Badge>
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOwner ? (
                    <>
                      <DropdownMenuItem onClick={() => router.push(`/app/community/post/${postId}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem onClick={handleReport}>
                      <Flag className="h-4 w-4 mr-2" />
                      Report
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent>
            {/* Title */}
            {post.title && (
              <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            )}

            {/* Body */}
            <div className="prose dark:prose-invert max-w-none mb-6">
              <p className="whitespace-pre-wrap">{post.body}</p>
            </div>

            {/* Media */}
            {post.media && post.media.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-6">
                {post.media.map((media, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
                  >
                    {media.type === 'image' && (
                      <img
                        src={media.url}
                        alt={media.alt || ''}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Stats & Actions */}
            <div className="flex items-center justify-between py-4 border-t border-b">
              <div className="flex items-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  <span>{post.view_count} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>{comments.length} comments</span>
                </div>
              </div>

              <Button
                variant={isLiked ? 'default' : 'outline'}
                onClick={handleLike}
                className={isLiked ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                <Heart className={`h-5 w-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {likeCount}
              </Button>
            </div>

            {/* Locked indicator */}
            {post.is_locked && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Lock className="h-4 w-4" />
                This post is locked. No new comments can be added.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comment Form */}
        {!post.is_locked && currentUserId && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmitComment} className="space-y-4">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px] resize-none"
                  maxLength={2000}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {newComment.length} / 2000
                  </span>
                  <Button
                    type="submit"
                    disabled={isSubmittingComment || !newComment.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Comments */}
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-bold">
            Comments ({comments.length})
          </h2>

          {comments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No comments yet. Be the first to comment!
              </CardContent>
            </Card>
          ) : (
            comments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                currentUserId={currentUserId}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

