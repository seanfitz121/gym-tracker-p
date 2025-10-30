'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { format, addMonths, addYears } from 'date-fns'

interface SetExpiryDateDialogProps {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onExpiryDateSet: (date: string) => void
  currentExpiryDate?: string | null
}

export function SetExpiryDateDialog({ 
  userId, 
  open, 
  onOpenChange, 
  onExpiryDateSet,
  currentExpiryDate 
}: SetExpiryDateDialogProps) {
  const [expiryDate, setExpiryDate] = useState(
    currentExpiryDate || format(addMonths(new Date(), 1), 'yyyy-MM-dd')
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleQuickSelect = (months: number) => {
    const date = addMonths(new Date(), months)
    setExpiryDate(format(date, 'yyyy-MM-dd'))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!expiryDate) {
      toast.error('Please select an expiry date')
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('profile')
        .update({ gym_expiry_date: expiryDate })
        .eq('id', userId)

      if (error) throw error

      toast.success('Gym membership expiry date updated!')
      onExpiryDateSet(expiryDate)
      onOpenChange(false)
    } catch (error) {
      console.error('Error setting expiry date:', error)
      toast.error('Failed to update expiry date')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemove = async () => {
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('profile')
        .update({ gym_expiry_date: null })
        .eq('id', userId)

      if (error) throw error

      toast.success('Gym membership expiry date removed')
      onExpiryDateSet('')
      onOpenChange(false)
    } catch (error) {
      console.error('Error removing expiry date:', error)
      toast.error('Failed to remove expiry date')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Set Gym Membership Expiry
          </DialogTitle>
          <DialogDescription>
            Set when your gym membership expires to get reminders
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Input */}
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              required
            />
          </div>

          {/* Quick Select Buttons */}
          <div className="space-y-2">
            <Label>Quick Select</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect(1)}
              >
                1 Month
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect(3)}
              >
                3 Months
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect(6)}
              >
                6 Months
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const date = addYears(new Date(), 1)
                  setExpiryDate(format(date, 'yyyy-MM-dd'))
                }}
              >
                1 Year
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            {currentExpiryDate && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemove}
                disabled={isSubmitting}
                className="flex-1"
              >
                Remove
              </Button>
            )}
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
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

