'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import type { SupplementDefinition } from '@/lib/types/supplement'

interface LogSupplementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplement: SupplementDefinition | null
  onSuccess: () => void
}

export function LogSupplementDialog({
  open,
  onOpenChange,
  supplement,
  onSuccess,
}: LogSupplementDialogProps) {
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [takenAt, setTakenAt] = useState(
    new Date().toISOString().slice(0, 16) // YYYY-MM-DDTHH:MM
  )
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!supplement) return

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/supplements/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplement_id: supplement.id,
          amount: parseFloat(amount),
          taken_at: new Date(takenAt).toISOString(),
          notes: notes.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to log supplement')
      }

      toast.success('Supplement logged successfully!')

      // Reset form
      setAmount('')
      setTakenAt(new Date().toISOString().slice(0, 16))
      setNotes('')

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error logging supplement:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to log supplement')
    } finally {
      setLoading(false)
    }
  }

  if (!supplement) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {supplement.icon && <span className="text-2xl">{supplement.icon}</span>}
            Log {supplement.name}
          </DialogTitle>
          <DialogDescription>Record your supplement intake</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Amount */}
          <div>
            <Label htmlFor="amount">
              Amount * <span className="text-sm text-gray-500">({supplement.unit})</span>
            </Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                id="amount"
                type="number"
                step="0.1"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`e.g., ${supplement.daily_goal}`}
                className="flex-1"
                required
                autoFocus
              />
              <div className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded-lg text-sm font-medium">
                {supplement.unit}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Daily goal: {supplement.daily_goal} {supplement.unit}
            </p>
          </div>

          {/* Time Taken */}
          <div>
            <Label htmlFor="taken-at">Time Taken *</Label>
            <Input
              id="taken-at"
              type="datetime-local"
              value={takenAt}
              onChange={(e) => setTakenAt(e.target.value)}
              className="mt-1.5"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              className="mt-1.5"
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
              style={{
                backgroundColor: supplement.color || '#A855F7',
              }}
            >
              {loading ? 'Logging...' : 'Log Intake'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

