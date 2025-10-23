'use client'

import { useState } from 'react'
import { useCreateExercise } from '@/lib/hooks/use-exercises'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface CreateCustomExerciseDialogProps {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (exerciseId: string, name: string, bodyPart?: string) => void
}

const bodyParts = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Full Body',
]

export function CreateCustomExerciseDialog({
  userId,
  open,
  onOpenChange,
  onCreated,
}: CreateCustomExerciseDialogProps) {
  const [name, setName] = useState('')
  const [bodyPart, setBodyPart] = useState<string>('')
  const { createExercise, loading } = useCreateExercise()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error('Please enter an exercise name')
      return
    }

    const exercise = await createExercise(userId, name.trim(), bodyPart || undefined)
    
    if (exercise) {
      toast.success(`✨ Created "${name}"!`, {
        description: 'Your custom exercise is ready to use',
      })
      onCreated(exercise.id, name.trim(), bodyPart || undefined)
      setName('')
      setBodyPart('')
    } else {
      toast.error('Failed to create exercise')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Create Custom Exercise
          </DialogTitle>
          <DialogDescription>
            Add your own exercise to track. Perfect for unique movements or equipment-specific exercises!
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="exercise-name">Exercise Name *</Label>
              <Input
                id="exercise-name"
                placeholder="e.g., Cable Crossover, Pistol Squats"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="body-part">Body Part (Optional)</Label>
              <Select value={bodyPart} onValueChange={setBodyPart}>
                <SelectTrigger id="body-part">
                  <SelectValue placeholder="Select body part..." />
                </SelectTrigger>
                <SelectContent>
                  {bodyParts.map((part) => (
                    <SelectItem key={part} value={part}>
                      {part}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? 'Creating...' : 'Create Exercise'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


