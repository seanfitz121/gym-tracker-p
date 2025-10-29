'use client'

import { useState } from 'react'
import { useDeleteBlogPost } from '@/lib/hooks/use-blog'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ArrowLeft, Calendar, User, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { BlogPost } from '@/lib/types/blog'

interface BlogPostViewProps {
  post: BlogPost
  isAdmin: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

export function BlogPostView({ post, isAdmin, onClose, onEdit, onDelete }: BlogPostViewProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { deletePost, loading: deleting } = useDeleteBlogPost()

  const handleDelete = async () => {
    try {
      await deletePost(post.id)
      toast.success('Post deleted')
      onDelete()
    } catch (error) {
      toast.error('Failed to delete post')
    }
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={onClose}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Blog
      </Button>

      {/* Post Content */}
      <Card>
        {post.cover_image_url && (
          <div className="aspect-video w-full overflow-hidden bg-gray-100">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-4xl font-bold">{post.title}</h1>
                  {!post.published && isAdmin && (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                </div>
                {post.subtitle && (
                  <p className="text-xl text-muted-foreground">{post.subtitle}</p>
                )}
              </div>

              {isAdmin && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={post.author?.avatar_url || undefined} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span>{post.author?.display_name || 'Admin'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{post.created_at ? format(new Date(post.created_at), 'MMMM d, yyyy') : 'No date'}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.body}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete Post'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

