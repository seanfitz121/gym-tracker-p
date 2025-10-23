'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Play, Trash2 } from 'lucide-react'
import type { Template, TemplatePayload } from '@/lib/types'

interface TemplateCardProps {
  template: Template
  onLoad: () => void
  onDelete: () => void
}

export function TemplateCard({ template, onLoad, onDelete }: TemplateCardProps) {
  const payload = template.payload as unknown as TemplatePayload
  const exerciseCount = payload.exercises?.length || 0
  const totalSets = payload.exercises?.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0) || 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{template.name}</CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Template?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this template.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Badge variant="secondary">
            {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
          </Badge>
          <Badge variant="secondary">
            {totalSets} set{totalSets !== 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="space-y-2">
          {payload.exercises?.slice(0, 3).map((exercise, idx) => (
            <div
              key={idx}
              className="text-sm text-gray-600 dark:text-gray-400"
            >
              • {exercise.name} ({exercise.sets?.length || 0} sets)
            </div>
          ))}
          {exerciseCount > 3 && (
            <div className="text-sm text-gray-500">
              +{exerciseCount - 3} more exercise{exerciseCount - 3 !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <Button
          onClick={onLoad}
          className="w-full"
          variant="default"
        >
          <Play className="mr-2 h-4 w-4" />
          Start from Template
        </Button>
      </CardContent>
    </Card>
  )
}

