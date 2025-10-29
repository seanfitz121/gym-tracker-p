'use client'

import { useBlogPosts } from '@/lib/hooks/use-blog'
import { Card, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, User, Eye, BookOpen } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

export function PublicBlogList() {
  const { posts, loading } = useBlogPosts()
  
  // Only show published posts
  const publishedPosts = posts.filter(post => post.published)

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading posts...</p>
      </div>
    )
  }

  if (publishedPosts.length === 0) {
    return (
      <Card>
        <CardHeader className="py-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Our first blog posts are coming soon! Check back for expert fitness tips and training advice.
          </p>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {publishedPosts.map((post) => (
        <Card
          key={post.id}
          className="overflow-hidden hover:shadow-lg transition-shadow"
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
                  <h2 className="text-2xl font-bold">
                    {post.title}
                  </h2>
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
                  <span>{post.author?.display_name || 'Plate Progress Team'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{post.created_at ? format(new Date(post.created_at), 'MMM d, yyyy') : 'No date'}</span>
                </div>
              </div>

              <p className="text-muted-foreground line-clamp-3">
                {post.body.substring(0, 200)}...
              </p>

              <Button asChild variant="default" size="sm" className="gap-2 w-fit">
                <Link href={`/blog/${post.slug || post.id}`}>
                  <Eye className="h-4 w-4" />
                  Read Full Article
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

