'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import type { SupplementType } from '@/lib/types/supplement'

interface AddSupplementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const SUPPLEMENT_TYPES: { value: SupplementType; label: string }[] = [
  { value: 'pills', label: 'Pills' },
  { value: 'tablets', label: 'Tablets' },
  { value: 'powder', label: 'Powder' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'liquid', label: 'Liquid' },
  { value: 'other', label: 'Other' },
]

const COMMON_UNITS = [
  { value: 'g', label: 'grams (g)' },
  { value: 'mg', label: 'milligrams (mg)' },
  { value: 'ml', label: 'milliliters (ml)' },
  { value: 'scoops', label: 'scoops' },
  { value: 'capsules', label: 'capsules' },
  { value: 'tablets', label: 'tablets' },
  { value: 'drops', label: 'drops' },
]

const PRESET_COLORS = [
  '#3B82F6', '#A855F7', '#F97316', '#10B981', '#06B6D4',
  '#EF4444', '#F59E0B', '#84CC16', '#EC4899', '#8B5CF6',
]

export function AddSupplementDialog({ open, onOpenChange, onSuccess }: AddSupplementDialogProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<SupplementType>('powder')
  const [unit, setUnit] = useState('g')
  const [customUnit, setCustomUnit] = useState('')
  const [dailyGoal, setDailyGoal] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [icon, setIcon] = useState('')
  const [isQuantitative, setIsQuantitative] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Please enter a supplement name')
      return
    }

    if (!dailyGoal || parseFloat(dailyGoal) <= 0) {
      toast.error('Please enter a valid daily goal')
      return
    }

    const finalUnit = unit === 'custom' ? customUnit : unit

    if (!finalUnit.trim()) {
      toast.error('Please select or enter a unit')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/supplements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type,
          unit: finalUnit,
          daily_goal: parseFloat(dailyGoal),
          color,
          icon: icon.trim() || undefined,
          is_quantitative: isQuantitative,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create supplement')
      }

      toast.success('Supplement added successfully!')
      
      // Reset form
      setName('')
      setType('powder')
      setUnit('g')
      setCustomUnit('')
      setDailyGoal('')
      setIcon('')
      setIsQuantitative(true)
      
      onSuccess()
    } catch (error) {
      console.error('Error creating supplement:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create supplement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Supplement</DialogTitle>
          <DialogDescription>
            Create a new supplement to track your daily intake
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">Supplement Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Creatine Monohydrate"
              className="mt-1.5"
              required
            />
          </div>

          {/* Type */}
          <div>
            <Label htmlFor="type">Type *</Label>
            <Select value={type} onValueChange={(value) => setType(value as SupplementType)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPLEMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Unit */}
          <div>
            <Label htmlFor="unit">Unit *</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMMON_UNITS.map((u) => (
                  <SelectItem key={u.value} value={u.value}>
                    {u.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom...</SelectItem>
              </SelectContent>
            </Select>
            {unit === 'custom' && (
              <Input
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                placeholder="Enter custom unit"
                className="mt-2"
                required
              />
            )}
          </div>

          {/* Daily Goal */}
          <div>
            <Label htmlFor="goal">Daily Goal * {unit !== 'custom' && unit && `(${unit})`}</Label>
            <Input
              id="goal"
              type="number"
              step="0.1"
              min="0"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(e.target.value)}
              placeholder="e.g., 5"
              className="mt-1.5"
              required
            />
          </div>

          {/* Icon (emoji) */}
          <div>
            <Label htmlFor="icon">Icon (optional emoji)</Label>
            <Input
              id="icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="💊 🥤 💪"
              maxLength={2}
              className="mt-1.5"
            />
          </div>

          {/* Color Picker */}
          <div>
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-10 w-10 rounded-lg transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-gray-100' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Quantitative Toggle */}
          <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <Checkbox
              id="quantitative"
              checked={isQuantitative}
              onCheckedChange={(checked) => setIsQuantitative(!!checked)}
            />
            <Label htmlFor="quantitative" className="text-sm cursor-pointer">
              Track measured amounts (uncheck for simple yes/no tracking)
            </Label>
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
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Adding...' : 'Add Supplement'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

