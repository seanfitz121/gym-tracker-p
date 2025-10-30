'use client'

import { useState } from 'react'
import { Heart, MoreVertical, Flag, Trash2, Reply } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { CommentWithAuthor } from '@/lib/types/community'
import { toast } from 'sonner'

interface CommentItemProps {
  comment: CommentWithAuthor
  postId: string
  currentUserId: string | null
  depth?: number
}

export function CommentItem({ comment, postId, currentUserId, depth = 0 }: CommentItemProps) {
  const [isLiked, setIsLiked] = useState(comment.is_liked_by_user)
  const [likeCount, setLikeCount] = useState(comment.like_count)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [replies, setReplies] = useState<CommentWithAuthor[]>(comment.replies || [])

  const isOwner = currentUserId === comment.user_id

  const handleLike = async () => {
    // Optimistic update
    setIsLiked(!isLiked)
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1)

    try {
      const res = await fetch('/api/community/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: 'comment',
          target_id: comment.id,
          kind: 'like'
        })
      })

      if (!res.ok) {
        // Revert on error
        setIsLiked(isLiked)
        setLikeCount(prev => isLiked ? prev + 1 : prev - 1)
        toast.error('Failed to like comment')
      }
    } catch (error) {
      // Revert on error
      setIsLiked(isLiked)
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1)
      toast.error('Failed to like comment')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('Comment deleted')
        // Parent should handle removing from list
        window.location.reload()
      } else {
        toast.error('Failed to delete comment')
      }
    } catch (error) {
      toast.error('Failed to delete comment')
    }
  }

  const handleReport = async () => {
    try {
      const res = await fetch('/api/community/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: 'comment',
          target_id: comment.id,
          reason: 'User reported this comment'
        })
      })

      const data = await res.json()
      
      if (res.ok) {
        toast.success(data.message)
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Failed to report comment')
    }
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!replyText.trim()) return

    setIsSubmittingReply(true)

    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: replyText,
          parent_comment_id: comment.id
        })
      })

      const data = await res.json()

      if (res.ok) {
        setReplies(prev => [...prev, data.comment])
        setReplyText('')
        setShowReplyForm(false)
        toast.success('Reply posted')
      } else {
        toast.error(data.error || 'Failed to post reply')
      }
    } catch (error) {
      toast.error('Failed to post reply')
    } finally {
      setIsSubmittingReply(false)
    }
  }

  // Max depth for threading (prevent too deep nesting)
  const maxDepth = 2

  return (
    <div className={depth > 0 ? 'ml-8 mt-4' : ''}>
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.author.avatar_url || undefined} />
              <AvatarFallback>
                {comment.author.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              {/* Author info */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{comment.author.username}</span>
                  {comment.author.rank_code && (
                    <Badge variant="secondary" className="text-xs">
                      {comment.author.rank_code}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isOwner ? (
                      <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={handleReport}>
                        <Flag className="h-4 w-4 mr-2" />
                        Report
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Comment body */}
              <p className="text-sm mb-3 whitespace-pre-wrap break-words">
                {comment.body}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`h-8 ${isLiked ? 'text-red-600' : ''}`}
                >
                  <Heart className={`h-3 w-3 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                  {likeCount > 0 && likeCount}
                </Button>

                {depth < maxDepth && currentUserId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="h-8"
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                )}
              </div>

              {/* Reply form */}
              {showReplyForm && (
                <form onSubmit={handleSubmitReply} className="mt-3 space-y-2">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-[80px] resize-none text-sm"
                    maxLength={1000}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowReplyForm(false)
                        setReplyText('')
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isSubmittingReply || !replyText.trim()}
                    >
                      Reply
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nested replies */}
      {replies.length > 0 && (
        <div className="space-y-2 mt-2">
          {replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              currentUserId={currentUserId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

