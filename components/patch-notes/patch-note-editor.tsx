'use client'

import { useState, useEffect } from 'react'
import { useCreatePatchNote, useUpdatePatchNote, useDeletePatchNote } from '@/lib/hooks/use-patch-notes'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { PatchNote } from '@/lib/types/patch-notes'

interface PatchNoteEditorProps {
  note?: PatchNote | null
  onSuccess: () => void
  onCancel: () => void
}

export function PatchNoteEditor({ note, onSuccess, onCancel }: PatchNoteEditorProps) {
  const [version, setVersion] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { createNote, loading: creating } = useCreatePatchNote()
  const { updateNote, loading: updating } = useUpdatePatchNote()
  const { deleteNote, loading: deleting } = useDeletePatchNote()

  const loading = creating || updating

  // Initialize form with existing note data
  useEffect(() => {
    if (note) {
      setVersion(note.version)
      setTitle(note.title)
      setContent(note.content)
      setPublished(note.published)
    }
  }, [note])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!version.trim() || !title.trim() || !content.trim()) {
      toast.error('Version, title, and content are required')
      return
    }

    try {
      const noteData = {
        version: version.trim(),
        title: title.trim(),
        content: content.trim(),
        published,
      }

      if (note) {
        await updateNote(note.id, noteData)
        toast.success('Patch note updated')
      } else {
        await createNote(noteData)
        toast.success('Patch note created')
      }

      onSuccess()
    } catch (error) {
      toast.error(note ? 'Failed to update patch note' : 'Failed to create patch note')
    }
  }

  const handleDelete = async () => {
    if (!note) return

    try {
      await deleteNote(note.id)
      toast.success('Patch note deleted')
      onSuccess()
    } catch (error) {
      toast.error('Failed to delete patch note')
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
          <CardTitle>{note ? 'Edit Patch Note' : 'New Patch Note'}</CardTitle>
          <CardDescription>
            Document updates, fixes, and new features for your users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Version */}
            <div className="space-y-2">
              <Label htmlFor="version">Version *</Label>
              <Input
                id="version"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.2.0"
                required
              />
              <p className="text-xs text-muted-foreground">
                Semantic version number (e.g., 1.2.0, 2.0.0-beta)
              </p>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Bug Fixes and Performance Improvements"
                required
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={"## New Features\n- Added dark mode support\n- New exercise templates\n\n## Bug Fixes\n- Fixed rest timer not playing sound\n- Resolved workout save issue"}
                rows={15}
                required
                className="font-mono text-sm"
              />
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Formatting tips:</strong></p>
                <p>• Use <code>## Heading</code> for section titles</p>
                <p>• Use <code>- Item</code> or <code>* Item</code> for bullet points</p>
                <p>• Leave blank lines between sections</p>
              </div>
            </div>

            {/* Published Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="published">Published</Label>
                <p className="text-sm text-muted-foreground">
                  Make this patch note visible to all users
                </p>
              </div>
              <Switch
                id="published"
                checked={published}
                onCheckedChange={setPublished}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : note ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              </div>

              {note && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Patch Note?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this patch note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

