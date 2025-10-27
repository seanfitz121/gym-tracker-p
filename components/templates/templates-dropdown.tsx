'use client'

import { useState } from 'react'
import { useTemplates, useDeleteTemplate } from '@/lib/hooks/use-templates'
import { useWorkoutStore } from '@/lib/store/workout-store'
import { useGetOrCreateExercise } from '@/lib/hooks/use-exercises'
import { TemplateCard } from './template-card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, LayoutTemplate } from 'lucide-react'
import { toast } from 'sonner'
import type { TemplatePayload } from '@/lib/types'

interface TemplatesDropdownProps {
  userId: string
}

export function TemplatesDropdown({ userId }: TemplatesDropdownProps) {
  const { templates, loading } = useTemplates(userId)
  const { deleteTemplate } = useDeleteTemplate()
  const { startWorkout, addExercise, addSet, addBlock, addExerciseToBlock, addSetToBlock } = useWorkoutStore()
  const { getOrCreate } = useGetOrCreateExercise()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleLoadTemplate = async (templatePayload: any, name: string) => {
    const payload = templatePayload as TemplatePayload
    startWorkout(name)

    try {
      // Load regular exercises and sets from template
      for (const exercise of payload.exercises) {
        // Get or create the exercise in the database
        const dbExercise = await getOrCreate(userId, exercise.name, exercise.bodyPart)
        
        if (!dbExercise) {
          toast.error(`Failed to load exercise: ${exercise.name}`)
          continue
        }
        
        addExercise(dbExercise.id, exercise.name, exercise.bodyPart)

        exercise.sets.forEach((set) => {
          addSet(dbExercise.id, {
            reps: set.reps,
            weight: set.weight || 0,
            rpe: set.rpe,
          })
        })
      }

      // Load blocks if they exist
      if (payload.blocks) {
        for (const block of payload.blocks) {
          const blockId = addBlock(block.blockType, block.rounds, block.restBetweenRounds)
          
          for (const exercise of block.exercises) {
            // Get or create the exercise in the database
            const dbExercise = await getOrCreate(userId, exercise.name, exercise.bodyPart)
            
            if (!dbExercise) {
              toast.error(`Failed to load exercise: ${exercise.name}`)
              continue
            }
            
            addExerciseToBlock(blockId, dbExercise.id, exercise.name, exercise.bodyPart)
            
            // Add sets for each round
            for (let round = 1; round <= block.rounds; round++) {
              exercise.sets.forEach((set) => {
                addSetToBlock(blockId, dbExercise.id, round, {
                  reps: set.reps,
                  weight: set.weight || 0,
                  rpe: set.rpe,
                })
              })
            }
          }
        }
      }

      toast.success('Template loaded!')
    } catch (error) {
      console.error('Error loading template:', error)
      toast.error('Failed to load template')
    }
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
      <div className="text-center py-4 text-gray-500 text-sm">
        Loading templates...
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-4 px-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <LayoutTemplate className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-500 mb-1">No templates yet</p>
        <p className="text-xs text-gray-400">
          Complete a workout, then save it as a template in Tools → Workout Templates
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        variant="outline"
        className="w-full justify-between"
        size="sm"
      >
        <span className="flex items-center gap-2">
          <LayoutTemplate className="h-4 w-4" />
          Start from Template ({templates.length})
        </span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {isExpanded && (
        <div className="space-y-2 pt-2 max-h-[400px] overflow-y-auto">
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
    </div>
  )
}

