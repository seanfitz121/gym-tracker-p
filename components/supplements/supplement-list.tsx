'use client'

import { useState, useEffect } from 'react'
import { Trash2, Edit, Pill } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { SupplementDefinition } from '@/lib/types/supplement'

interface SupplementListProps {
  userId: string
  refreshKey: number
  onUpdate: () => void
}

export function SupplementList({ userId, refreshKey, onUpdate }: SupplementListProps) {
  const [loading, setLoading] = useState(true)
  const [supplements, setSupplements] = useState<SupplementDefinition[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchSupplements()
  }, [refreshKey])

  const fetchSupplements = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/supplements')

      if (!response.ok) {
        throw new Error('Failed to fetch supplements')
      }

      const data = await response.json()
      setSupplements(data.supplements || [])
    } catch (error) {
      console.error('Error fetching supplements:', error)
      toast.error('Failed to load supplements')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/supplements/${deleteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete supplement')
      }

      toast.success('Supplement deleted successfully')
      setDeleteId(null)
      onUpdate()
    } catch (error) {
      console.error('Error deleting supplement:', error)
      toast.error('Failed to delete supplement')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    )
  }

  if (supplements.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950 mb-4">
          <Pill className="h-8 w-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Supplements Yet</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Add your first supplement from the Dashboard tab to get started.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {supplements.map((supplement) => (
          <div
            key={supplement.id}
            className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-950 border border-blue-200 dark:border-blue-900 shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            {/* Color accent */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: supplement.color || '#A855F7' }}
            />

            <div className="flex items-start justify-between gap-4">
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {supplement.icon && (
                    <span className="text-2xl leading-none">{supplement.icon}</span>
                  )}
                  <h3 className="font-bold text-lg truncate">{supplement.name}</h3>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>{' '}
                    <span className="font-medium capitalize">{supplement.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Daily Goal:</span>{' '}
                    <span className="font-medium">
                      {supplement.daily_goal} {supplement.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Tracking:</span>{' '}
                    <span className="font-medium">
                      {supplement.is_quantitative ? 'Measured' : 'Yes/No'}
                    </span>
                  </div>
                  {supplement.reminder_enabled && supplement.reminder_time && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Reminder:</span>{' '}
                      <span className="font-medium">{supplement.reminder_time}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteId(supplement.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors touch-manipulation"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplement?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this supplement and all associated log entries. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

