'use client'

import { useState, useEffect } from 'react'
import { useSettingsStore } from '@/lib/store/settings-store'
import { useCreateWeightLog, useUpdateWeightLog } from '@/lib/hooks/use-weight'
import { WeightLog } from '@/lib/types/weight'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Plus, Save } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface WeightEntryFormProps {
  editingLog?: WeightLog | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function WeightEntryForm({ editingLog, onSuccess, onCancel }: WeightEntryFormProps) {
  const { defaultWeightUnit } = useSettingsStore()
  const { createLog, loading: creating } = useCreateWeightLog()
  const { updateLog, loading: updating } = useUpdateWeightLog()

  const [weight, setWeight] = useState('')
  const [unit, setUnit] = useState<'kg' | 'lb'>(defaultWeightUnit)
  const [date, setDate] = useState<Date>(new Date())

  const loading = creating || updating

  // Initialize form with editing log data
  useEffect(() => {
    if (editingLog) {
      setWeight(editingLog.weight.toString())
      setUnit(editingLog.unit)
      setDate(new Date(editingLog.logged_at))
    } else {
      // Reset to defaults
      setWeight('')
      setUnit(defaultWeightUnit)
      setDate(new Date())
    }
  }, [editingLog, defaultWeightUnit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const weightNum = parseFloat(weight)
    if (isNaN(weightNum) || weightNum <= 0) {
      toast.error('Please enter a valid weight')
      return
    }

    const logged_at = format(date, 'yyyy-MM-dd')

    if (editingLog) {
      // Update existing log
      const result = await updateLog(editingLog.id, {
        weight: weightNum,
        unit,
        logged_at,
      })

      if (result) {
        toast.success('Weight entry updated!')
        onSuccess?.()
      } else {
        toast.error('Failed to update weight entry')
      }
    } else {
      // Create new log
      const result = await createLog({
        weight: weightNum,
        unit,
        logged_at,
      })

      if (result) {
        toast.success('Weight logged!')
        setWeight('')
        setDate(new Date())
        onSuccess?.()
      } else {
        toast.error('Failed to log weight')
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {editingLog ? (
            <>
              <Save className="h-5 w-5" />
              Edit Weight Entry
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" />
              Log Your Weight
            </>
          )}
        </CardTitle>
        <CardDescription>
          {editingLog ? 'Update your weight entry' : 'Track your bodyweight progress'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                max="999"
                placeholder="75.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={unit} onValueChange={(v) => setUnit(v as 'kg' | 'lb')} disabled={loading}>
                <SelectTrigger id="unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lb">lb</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                  disabled={loading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  disabled={(date) => date > new Date() || date < new Date('2000-01-01')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Saving...' : editingLog ? 'Update' : 'Log Weight'}
            </Button>
            {editingLog && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}


