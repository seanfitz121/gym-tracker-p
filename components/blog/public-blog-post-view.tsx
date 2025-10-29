'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AdBanner } from '@/components/ads/ad-banner'
import { AD_SLOTS } from '@/lib/config/ads'
import { Calendar, User, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import type { BlogPost } from '@/lib/types/blog'

interface PublicBlogPostViewProps {
  post: BlogPost
}

export function PublicBlogPostView({ post }: PublicBlogPostViewProps) {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Back Button */}
      <Button asChild variant="ghost" size="sm" className="gap-2">
        <Link href="/blog">
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>
      </Button>

      {/* Article */}
      <article className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            {post.title}
          </h1>
          
          {post.subtitle && (
            <p className="text-xl text-muted-foreground">
              {post.subtitle}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.author?.avatar_url || undefined} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{post.author?.display_name || 'Plate Progress Team'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{post.created_at ? format(new Date(post.created_at), 'MMMM d, yyyy') : 'No date'}</span>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        {post.cover_image_url && (
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Ad - After header */}
        <div className="py-4">
          <AdBanner 
            adSlot={AD_SLOTS.CONTENT_SEPARATOR}
            adFormat="auto"
            showPlaceholder={true}
            className="max-w-3xl mx-auto"
          />
        </div>

        {/* Content */}
        <Card>
          <CardContent className="prose prose-gray dark:prose-invert max-w-none p-8">
            <div className="whitespace-pre-wrap leading-relaxed text-base">
              {post.body}
            </div>
          </CardContent>
        </Card>

        {/* Ad - After content */}
        <div className="py-4">
          <AdBanner 
            adSlot={AD_SLOTS.BOTTOM_BANNER}
            adFormat="auto"
            showPlaceholder={true}
            className="max-w-3xl mx-auto"
          />
        </div>
      </article>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2">
        <CardContent className="p-8 text-center space-y-4">
          <h3 className="text-2xl font-bold">Ready to Track Your Progress?</h3>
          <p className="text-muted-foreground">
            Start logging workouts, tracking PRs, and crushing your fitness goals with Plate Progress.
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link href="/auth">
              Get Started Free
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

