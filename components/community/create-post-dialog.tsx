'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CommunityCategory, PostWithAuthor } from '@/lib/types/community'
import { toast } from 'sonner'

interface CreatePostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: CommunityCategory[]
  onPostCreated: (post: PostWithAuthor) => void
}

export function CreatePostDialog({
  open,
  onOpenChange,
  categories,
  onPostCreated
}: CreatePostDialogProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'friends'>('public')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!category || !body) {
      toast.error('Category and content are required')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || null,
          body,
          category,
          visibility
        })
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('Post creation error:', data)
        const errorMsg = data.details 
          ? `${data.error}: ${data.details}` 
          : (data.error || 'Failed to create post')
        toast.error(errorMsg)
        return
      }

      toast.success('Post created successfully!')
      
      // Reset form
      setTitle('')
      setBody('')
      setCategory('')
      setVisibility('public')
      
      // Close dialog and notify parent
      onPostCreated(data.post)
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  const characterCount = body.length
  const maxCharacters = 5000

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.code} value={cat.code}>
                    <div className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title (optional) */}
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              placeholder="Give your post a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Content *</Label>
            <Textarea
              id="body"
              placeholder="Share your thoughts, ask questions, or post tips..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[200px] resize-none"
              maxLength={maxCharacters}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Markdown supported</span>
              <span className={characterCount > maxCharacters * 0.9 ? 'text-amber-600' : ''}>
                {characterCount} / {maxCharacters}
              </span>
            </div>
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as 'public' | 'friends')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Everyone can see</SelectItem>
                <SelectItem value="friends">Friends Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !body || !category}
              className="bg-gradient-to-r from-blue-600 to-cyan-600"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

