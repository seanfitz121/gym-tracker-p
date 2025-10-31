'use client'

import { useState } from 'react'
import { useBlogPosts } from '@/lib/hooks/use-blog'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { PlusCircle, Calendar, User, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { BlogPostEditor } from './blog-post-editor'
import { BlogPostView } from './blog-post-view'
import type { BlogPost } from '@/lib/types/blog'

interface BlogPageProps {
  userId: string
  isAdmin: boolean
}

export function BlogPage({ userId, isAdmin }: BlogPageProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const { posts, loading, refresh, pagination } = useBlogPosts(currentPage, 10)
  const [showEditor, setShowEditor] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)

  const handleCreateSuccess = () => {
    setShowEditor(false)
    setCurrentPage(1)
    refresh()
  }

  const handleEditSuccess = () => {
    setEditingPost(null)
    refresh()
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleViewPost = (post: BlogPost) => {
    setSelectedPost(post)
  }

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(null)
    setEditingPost(post)
  }

  if (selectedPost) {
    return (
      <BlogPostView
        post={selectedPost}
        isAdmin={isAdmin}
        onClose={() => setSelectedPost(null)}
        onEdit={() => handleEdit(selectedPost)}
        onDelete={() => {
          setSelectedPost(null)
          refresh()
        }}
      />
    )
  }

  if (showEditor || editingPost) {
    return (
      <BlogPostEditor
        post={editingPost}
        onSuccess={editingPost ? handleEditSuccess : handleCreateSuccess}
        onCancel={() => {
          setShowEditor(false)
          setEditingPost(null)
        }}
      />
    )
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog</h1>
          <p className="text-muted-foreground">
            Fitness tips, training insights, and workout advice
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowEditor(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Post
          </Button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No blog posts yet.</p>
            {isAdmin && (
              <Button
                onClick={() => setShowEditor(true)}
                variant="outline"
                className="mt-4"
              >
                Create your first post
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Blog Posts List */}
      {!loading && posts.length > 0 && (
        <div className="space-y-6">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleViewPost(post)}
            >
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
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold hover:text-blue-600 transition-colors">
                          {post.title}
                        </h2>
                        {!post.published && isAdmin && (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                      </div>
                      {post.subtitle && (
                        <p className="text-lg text-muted-foreground">
                          {post.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={post.author?.avatar_url || undefined} />
                        <AvatarFallback>
                          <User className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <span>{post.author?.display_name || 'Admin'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{post.created_at ? format(new Date(post.created_at), 'MMM d, yyyy') : 'No date'}</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground line-clamp-3">
                    {post.body.substring(0, 200)}...
                  </p>

                  <Button variant="ghost" size="sm" className="gap-2">
                    <Eye className="h-4 w-4" />
                    Read More
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum: number
              if (pagination.totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className="min-w-[2.5rem]"
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= pagination.totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Pagination Info */}
      {!loading && pagination && (
        <div className="text-center text-sm text-muted-foreground mt-4">
          Page {pagination.page} of {pagination.totalPages} ({pagination.total} posts)
        </div>
      )}
    </div>
  )
}

