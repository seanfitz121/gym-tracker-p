import { useState, useEffect } from 'react'
import { PatchNote, CreatePatchNoteInput, UpdatePatchNoteInput } from '@/lib/types/patch-notes'

export function usePatchNotes() {
  const [notes, setNotes] = useState<PatchNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/patch-notes')
      
      if (!response.ok) {
        throw new Error('Failed to fetch patch notes')
      }

      const data = await response.json()
      setNotes(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching patch notes:', err)
      setError(err instanceof Error ? err.message : 'Failed to load patch notes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  return { notes, loading, error, refresh: fetchNotes }
}

export function useCreatePatchNote() {
  const [loading, setLoading] = useState(false)

  const createNote = async (input: CreatePatchNoteInput): Promise<PatchNote | null> => {
    try {
      setLoading(true)
      const response = await fetch('/api/patch-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create patch note')
      }

      const note = await response.json()
      return note
    } catch (err) {
      console.error('Error creating patch note:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createNote, loading }
}

export function useUpdatePatchNote() {
  const [loading, setLoading] = useState(false)

  const updateNote = async (id: string, input: UpdatePatchNoteInput): Promise<PatchNote | null> => {
    try {
      setLoading(true)
      const response = await fetch(`/api/patch-notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update patch note')
      }

      const note = await response.json()
      return note
    } catch (err) {
      console.error('Error updating patch note:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { updateNote, loading }
}

export function useDeletePatchNote() {
  const [loading, setLoading] = useState(false)

  const deleteNote = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      const response = await fetch(`/api/patch-notes/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete patch note')
      }

      return true
    } catch (err) {
      console.error('Error deleting patch note:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { deleteNote, loading }
}

