'use client'

import { useState } from 'react'
import { HydrationLog } from '@/lib/types/hydration'
import { getTodaysLogs, formatWaterAmount } from '@/lib/utils/hydration'
import { useDeleteHydrationLog } from '@/lib/hooks/use-hydration'
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
import { Clock, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'

interface TodaysLogsProps {
  logs: HydrationLog[]
  onDeleted: () => void
}

export function TodaysLogs({ logs, onDeleted }: TodaysLogsProps) {
  const { deleteLog, loading } = useDeleteHydrationLog()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [logToDelete, setLogToDelete] = useState<HydrationLog | null>(null)

  const todaysLogs = getTodaysLogs(logs)
  const totalToday = todaysLogs.reduce((sum, log) => sum + log.amount_ml, 0)

  const handleDeleteClick = (log: HydrationLog) => {
    setLogToDelete(log)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!logToDelete) return

    const success = await deleteLog(logToDelete.id)
    if (success) {
      toast.success('Entry deleted')
      onDeleted()
    } else {
      toast.error('Failed to delete entry')
    }
    setDeleteDialogOpen(false)
    setLogToDelete(null)
  }

  if (todaysLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Log
          </CardTitle>
          <CardDescription>Your water intake entries for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No entries yet today. Start tracking your hydration!
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Log
          </CardTitle>
          <CardDescription>
            {todaysLogs.length} {todaysLogs.length === 1 ? 'entry' : 'entries'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {todaysLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground">
                  {format(parseISO(log.logged_at), 'h:mm a')}
                </div>
                <div className="font-medium">
                  {formatWaterAmount(log.amount_ml)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteClick(log)}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ))}

          {/* Total */}
          <div className="pt-4 border-t mt-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total Today</span>
              <span className="text-blue-600">
                {formatWaterAmount(totalToday)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this hydration entry? This action cannot be undone.
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


