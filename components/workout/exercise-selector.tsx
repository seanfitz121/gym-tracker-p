'use client'

import { useState, useMemo } from 'react'
import { useExerciseLibrary, useGetOrCreateExercise } from '@/lib/hooks/use-exercises'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { CreateCustomExerciseDialog } from './create-custom-exercise-dialog'

interface ExerciseSelectorProps {
  userId: string
  onSelect: (exerciseId: string, name: string, bodyPart?: string) => void
  onClose: () => void
}

export function ExerciseSelector({ userId, onSelect, onClose }: ExerciseSelectorProps) {
  const { exercises, loading } = useExerciseLibrary(userId)
  const { getOrCreate } = useGetOrCreateExercise()
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const filteredExercises = useMemo(() => {
    if (!search) return exercises
    
    const query = search.toLowerCase()
    return exercises.filter(
      (ex) =>
        ex.name.toLowerCase().includes(query) ||
        ex.bodyPart?.toLowerCase().includes(query)
    )
  }, [exercises, search])

  const handleSelect = async (name: string, bodyPart?: string) => {
    setCreating(true)
    
    try {
      const exercise = await getOrCreate(userId, name, bodyPart)
      
      if (exercise) {
        onSelect(exercise.id, name, bodyPart)
      } else {
        toast.error('Failed to add exercise')
      }
    } catch (error) {
      toast.error('Failed to add exercise')
    } finally {
      setCreating(false)
    }
  }

  // Group exercises by body part
  const groupedExercises = useMemo(() => {
    const groups: Record<string, typeof filteredExercises> = {}
    
    filteredExercises.forEach((ex) => {
      const part = ex.bodyPart || 'Other'
      if (!groups[part]) groups[part] = []
      groups[part].push(ex)
    })
    
    return groups
  }, [filteredExercises])

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Exercise</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Create Custom Exercise Button */}
            <Button
              onClick={() => setShowCreateDialog(true)}
              variant="outline"
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Custom Exercise
            </Button>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search exercises..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>

          {/* Exercise List */}
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading exercises...</div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {search ? 'No exercises found' : 'No exercises available'}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedExercises).map(([bodyPart, exs]) => (
                <div key={bodyPart}>
                  <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {bodyPart}
                  </h3>
                  <div className="space-y-1">
                    {exs.map((ex) => (
                      <Button
                        key={`${ex.name}-${ex.isCustom}`}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleSelect(ex.name, ex.bodyPart)}
                        disabled={creating}
                      >
                        <span className="flex-1 text-left">{ex.name}</span>
                        {ex.isCustom && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Custom
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {showCreateDialog && (
      <CreateCustomExerciseDialog
        userId={userId}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={(exerciseId, name, bodyPart) => {
          onSelect(exerciseId, name, bodyPart)
          setShowCreateDialog(false)
          onClose()
        }}
      />
    )}
  </>
  )
}

