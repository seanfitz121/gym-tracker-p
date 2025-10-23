'use client'

import { useState } from 'react'
import { usePatchNotes } from '@/lib/hooks/use-patch-notes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PlusCircle, Calendar, User, Tag } from 'lucide-react'
import { format } from 'date-fns'
import { PatchNoteEditor } from './patch-note-editor'
import type { PatchNote } from '@/lib/types/patch-notes'

interface PatchNotesPageProps {
  userId: string
  isAdmin: boolean
}

export function PatchNotesPage({ userId, isAdmin }: PatchNotesPageProps) {
  const { notes, loading, refresh } = usePatchNotes()
  const [showEditor, setShowEditor] = useState(false)
  const [editingNote, setEditingNote] = useState<PatchNote | null>(null)

  const handleCreateSuccess = () => {
    setShowEditor(false)
    refresh()
  }

  const handleEditSuccess = () => {
    setEditingNote(null)
    refresh()
  }

  const handleEdit = (note: PatchNote) => {
    setEditingNote(note)
  }

  const handleDelete = () => {
    refresh()
  }

  if (showEditor || editingNote) {
    return (
      <PatchNoteEditor
        note={editingNote}
        onSuccess={editingNote ? handleEditSuccess : handleCreateSuccess}
        onCancel={() => {
          setShowEditor(false)
          setEditingNote(null)
        }}
      />
    )
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patch Notes</h1>
          <p className="text-muted-foreground">
            Latest updates, fixes, and improvements
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowEditor(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Update
          </Button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading patch notes...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && notes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No patch notes yet.</p>
            {isAdmin && (
              <Button
                onClick={() => setShowEditor(true)}
                variant="outline"
                className="mt-4"
              >
                Create your first update
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Patch Notes List */}
      {!loading && notes.length > 0 && (
        <div className="space-y-4">
          {notes.map((note) => (
            <Card key={note.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant="default" className="text-sm font-mono">
                        <Tag className="h-3 w-3 mr-1" />
                        v{note.version}
                      </Badge>
                      {!note.published && isAdmin && (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(note.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <CardTitle className="text-2xl">{note.title}</CardTitle>
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(note)}
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="space-y-3">
                  {/* Format content into bullet points or sections */}
                  {note.content.split('\n').map((line, index) => {
                    if (!line.trim()) return null
                    
                    // Check if line starts with category markers
                    if (line.startsWith('## ')) {
                      return (
                        <h3 key={index} className="text-lg font-semibold mt-4 mb-2">
                          {line.replace('## ', '')}
                        </h3>
                      )
                    }
                    
                    // Check if line is a bullet point
                    if (line.startsWith('- ') || line.startsWith('* ')) {
                      return (
                        <div key={index} className="flex gap-2">
                          <span className="text-blue-600 dark:text-blue-400">•</span>
                          <p className="flex-1">{line.replace(/^[-*]\s/, '')}</p>
                        </div>
                      )
                    }
                    
                    // Regular paragraph
                    return (
                      <p key={index} className="text-muted-foreground">
                        {line}
                      </p>
                    )
                  })}
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-2 mt-6 pt-4 border-t text-sm text-muted-foreground">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={note.author?.avatar_url || undefined} />
                    <AvatarFallback>
                      <User className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <span>Posted by {note.author?.display_name || 'Admin'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

