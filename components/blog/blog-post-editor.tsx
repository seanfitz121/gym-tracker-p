'use client'

import { useState, useEffect } from 'react'
import { useCreateBlogPost, useUpdateBlogPost } from '@/lib/hooks/use-blog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'
import type { BlogPost } from '@/lib/types/blog'

interface BlogPostEditorProps {
  post?: BlogPost | null
  onSuccess: () => void
  onCancel: () => void
}

export function BlogPostEditor({ post, onSuccess, onCancel }: BlogPostEditorProps) {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [body, setBody] = useState('')
  const [published, setPublished] = useState(false)

  const { createPost, loading: creating } = useCreateBlogPost()
  const { updatePost, loading: updating } = useUpdateBlogPost()

  const loading = creating || updating

  // Initialize form with existing post data
  useEffect(() => {
    if (post) {
      setTitle(post.title)
      setSubtitle(post.subtitle || '')
      setCoverImageUrl(post.cover_image_url || '')
      setBody(post.body)
      setPublished(post.published ?? false)
    }
  }, [post])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !body.trim()) {
      toast.error('Title and body are required')
      return
    }

    try {
      const postData = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        cover_image_url: coverImageUrl.trim() || undefined,
        body: body.trim(),
        published,
      }

      if (post) {
        await updatePost(post.id, postData)
        toast.success('Post updated')
      } else {
        await createPost(postData)
        toast.success('Post created')
      }

      onSuccess()
    } catch (error) {
      toast.error(post ? 'Failed to update post' : 'Failed to create post')
    }
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <Button variant="ghost" onClick={onCancel} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Cancel
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{post ? 'Edit Post' : 'New Blog Post'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title..."
                required
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Optional subtitle..."
              />
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <Label htmlFor="cover-image">Cover Image URL</Label>
              <Input
                id="cover-image"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                type="url"
              />
              {coverImageUrl && (
                <div className="mt-2 aspect-video w-full max-w-md overflow-hidden rounded-lg border bg-gray-100">
                  <img
                    src={coverImageUrl}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Optional. Paste an image URL for the cover photo.
              </p>
            </div>

            {/* Body */}
            <div className="space-y-2">
              <Label htmlFor="body">Body *</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your post content here..."
                rows={12}
                required
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Write your post content. Paragraphs will be separated by line breaks.
              </p>
            </div>

            {/* Published Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="published">Published</Label>
                <p className="text-sm text-muted-foreground">
                  Make this post visible to all users
                </p>
              </div>
              <Switch
                id="published"
                checked={published}
                onCheckedChange={setPublished}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

