'use client'

import { useState } from 'react'
import { WeightLog } from '@/lib/types/weight'
import { useDeleteWeightLog } from '@/lib/hooks/use-weight'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Edit2, Trash2, History } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'

interface WeightHistoryProps {
  logs: WeightLog[]
  onEdit: (log: WeightLog) => void
  onDeleted: () => void
}

export function WeightHistory({ logs, onEdit, onDeleted }: WeightHistoryProps) {
  const { deleteLog, loading } = useDeleteWeightLog()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [logToDelete, setLogToDelete] = useState<WeightLog | null>(null)

  const handleDeleteClick = (log: WeightLog) => {
    setLogToDelete(log)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!logToDelete) return

    const success = await deleteLog(logToDelete.id)
    if (success) {
      toast.success('Weight entry deleted')
      onDeleted()
    } else {
      toast.error('Failed to delete entry')
    }
    setDeleteDialogOpen(false)
    setLogToDelete(null)
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Weight History
          </CardTitle>
          <CardDescription>Your recent weight entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No entries yet. Log your first weight above!
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sort logs by date (most recent first)
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
  )

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Weight History
          </CardTitle>
          <CardDescription>
            {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sortedLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-semibold">
                      {log.weight} {log.unit}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {format(parseISO(log.logged_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(log)}
                    disabled={loading}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(log)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Weight Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the weight entry from{' '}
              {logToDelete && format(parseISO(logToDelete.logged_at), 'MMM d, yyyy')}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}


