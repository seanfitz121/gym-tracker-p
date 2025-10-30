'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, MessageCircle, Eye, MoreVertical, Flag, Trash2, Edit, Lock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { PostWithAuthor } from '@/lib/types/community'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface PostCardProps {
  post: PostWithAuthor
  onPostDeleted?: (postId: string) => void
}

export function PostCard({ post, onPostDeleted }: PostCardProps) {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(post.is_liked_by_user)
  const [likeCount, setLikeCount] = useState(post.like_count)
  const [isLiking, setIsLiking] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Safety check - ensure post has required data
  if (!post.author || !post.category_info) {
    console.error('Post missing required data:', post)
    return null
  }

  // Get current user
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    fetchUser()
  }, [])

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (isLiking) return

    setIsLiking(true)
    
    // Optimistic update
    setIsLiked(!isLiked)
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1)

    try {
      const res = await fetch('/api/community/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: 'post',
          target_id: post.id,
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
    } finally {
      setIsLiking(false)
    }
  }

  const handleReport = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    try {
      const res = await fetch('/api/community/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: 'post',
          target_id: post.id,
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

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const res = await fetch(`/api/community/posts/${post.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('Post deleted')
        if (onPostDeleted) {
          onPostDeleted(post.id)
        }
      } else {
        toast.error('Failed to delete post')
      }
    } catch (error) {
      toast.error('Failed to delete post')
    }
  }

  const handleCardClick = () => {
    // Record view
    fetch(`/api/community/posts/${post.id}/view`, { method: 'POST' })
      .catch(err => console.error('Failed to record view:', err))

    // Navigate to post detail
    router.push(`/app/community/post/${post.id}`)
  }

  const isOwner = currentUserId === post.user_id

  return (
    <Card 
      className="cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar_url || undefined} />
              <AvatarFallback>
                {post.author.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{post.author.username}</span>
                {post.author.rank_code && (
                  <Badge variant="secondary" className="text-xs">
                    {post.author.rank_code}
                  </Badge>
                )}
                {post.author.is_premium && (
                  <Badge className="text-xs bg-gradient-to-r from-purple-600 to-pink-600">
                    Pro
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                <span>•</span>
                <Badge variant="outline" className="text-xs">
                  {post.category_info.icon} {post.category_info.name}
                </Badge>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner ? (
                <>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/app/community/post/${post.id}/edit`)
                  }}>
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
          <h3 className="text-xl font-bold mb-2">{post.title}</h3>
        )}

        {/* Body (truncated) */}
        <p className="text-muted-foreground mb-3 line-clamp-3">
          {post.body}
        </p>

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {post.media.slice(0, 4).map((media, idx) => (
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
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.view_count}
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {post.comment_count}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className={isLiked ? 'text-red-600' : ''}
          >
            <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
            {likeCount}
          </Button>
        </div>

        {/* Locked indicator */}
        {post.is_locked && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 pt-2 border-t">
            <Lock className="h-3 w-3" />
            This post is locked. No new comments can be added.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

