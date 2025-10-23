'use client'

import { useState } from 'react'
import { useTemplates, useCreateTemplate, useDeleteTemplate } from '@/lib/hooks/use-templates'
import { useWorkoutStore } from '@/lib/store/workout-store'
import { TemplateCard } from './template-card'
import { CreateTemplateDialog } from './create-template-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { TemplatePayload } from '@/lib/types'

interface TemplateManagerProps {
  userId: string
}

export function TemplateManager({ userId }: TemplateManagerProps) {
  const { templates, loading } = useTemplates(userId)
  const { createTemplate } = useCreateTemplate()
  const { deleteTemplate } = useDeleteTemplate()
  const { startWorkout, addExercise, addSet, activeWorkout } = useWorkoutStore()
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const handleCreateFromWorkout = async (name: string) => {
    if (!activeWorkout) {
      toast.error('No active workout to save as template')
      return
    }

    const payload: TemplatePayload = {
      exercises: activeWorkout.exercises.map((ex) => ({
        name: ex.name,
        bodyPart: ex.bodyPart,
        sets: ex.sets.map((set) => ({
          reps: set.reps,
          weight: set.weight,
          rpe: set.rpe,
        })),
      })),
    }

    const template = await createTemplate(userId, name, payload)

    if (template) {
      toast.success('Template created!')
      setShowCreateDialog(false)
    } else {
      toast.error('Failed to create template')
    }
  }

  const handleLoadTemplate = (templatePayload: any, name: string) => {
    const payload = templatePayload as TemplatePayload
    startWorkout(name)

    // Load exercises and sets from template
    payload.exercises.forEach((exercise) => {
      // For now, we'll create a temp ID - in real app we'd need to resolve exercise IDs
      const tempExerciseId = `temp-${Date.now()}-${Math.random()}`
      
      addExercise(tempExerciseId, exercise.name, exercise.bodyPart)

      exercise.sets.forEach((set) => {
        addSet(tempExerciseId, {
          reps: set.reps,
          weight: set.weight || 0,
          rpe: set.rpe,
        })
      })
    })

    toast.success('Template loaded!')
  }

  const handleDelete = async (templateId: string) => {
    const success = await deleteTemplate(templateId)
    
    if (success) {
      toast.success('Template deleted')
    } else {
      toast.error('Failed to delete template')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Loading templates...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={() => setShowCreateDialog(true)}
        className="w-full"
        size="lg"
        disabled={!activeWorkout}
      >
        <Plus className="mr-2 h-5 w-5" />
        Save Current Workout as Template
      </Button>

      {templates.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No templates yet</p>
          <p className="text-sm text-gray-400">
            Start a workout and save it as a template for quick access
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onLoad={() => handleLoadTemplate(template.payload, template.name)}
              onDelete={() => handleDelete(template.id)}
            />
          ))}
        </div>
      )}

      <CreateTemplateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateFromWorkout}
      />
    </div>
  )
}

