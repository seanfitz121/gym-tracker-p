'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus } from 'lucide-react'
import { Exercise } from '@/lib/types'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface AddOneRMLiftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exercise: Exercise
  onLiftAdded: () => void
}

export function AddOneRMLiftDialog({ 
  open, 
  onOpenChange, 
  exercise,
  onLiftAdded 
}: AddOneRMLiftDialogProps) {
  const [weight, setWeight] = useState('')
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg')
  const [loggedAt, setLoggedAt] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!weight || parseFloat(weight) <= 0) {
      toast.error('Please enter a valid weight')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/one-rm/lifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise_id: exercise.id,
          weight: parseFloat(weight),
          weight_unit: weightUnit,
          logged_at: new Date(loggedAt).toISOString(),
          notes: notes.trim() || undefined,
        }),
      })

      if (!res.ok) throw new Error('Failed to add lift')

      toast.success('1RM lift added!')
      onLiftAdded()
      onOpenChange(false)
      
      // Reset form
      setWeight('')
      setNotes('')
      setLoggedAt(format(new Date(), 'yyyy-MM-dd'))
    } catch (error) {
      console.error('Error adding lift:', error)
      toast.error('Failed to add lift')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add 1RM Lift
          </DialogTitle>
          <DialogDescription>
            Manually log a 1RM lift for {exercise.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Weight */}
          <div className="space-y-2">
            <Label htmlFor="weight">Weight</Label>
            <div className="flex gap-2">
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="100"
                required
                className="flex-1"
              />
              <Select value={weightUnit} onValueChange={(v) => setWeightUnit(v as 'kg' | 'lb')}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lb">lb</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="loggedAt">Date</Label>
            <Input
              id="loggedAt"
              type="date"
              value={loggedAt}
              onChange={(e) => setLoggedAt(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Competition lift, new PR, felt strong"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Adding...' : 'Add Lift'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

