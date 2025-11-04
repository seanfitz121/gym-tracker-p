'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Trash2 } from 'lucide-react'
import type { IntervalTemplate } from '@/lib/types/cardio'
import { formatDuration } from '@/lib/utils/cardio-calculations'

interface IntervalBuilderProps {
  intervals: IntervalTemplate[]
  onChange: (intervals: IntervalTemplate[]) => void
}

export function IntervalBuilder({ intervals, onChange }: IntervalBuilderProps) {
  const addInterval = () => {
    onChange([
      ...intervals,
      {
        label: `Interval ${intervals.length + 1}`,
        duration: 60, // 1 minute default
        rounds: 1,
      },
    ])
  }

  const updateInterval = (index: number, updates: Partial<IntervalTemplate>) => {
    const updated = [...intervals]
    updated[index] = { ...updated[index], ...updates }
    onChange(updated)
  }

  const removeInterval = (index: number) => {
    onChange(intervals.filter((_, i) => i !== index))
  }

  const totalDuration = intervals.reduce((sum, interval) => {
    const duration = interval.duration || 0
    const rounds = interval.rounds || 1
    return sum + (duration * rounds)
  }, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Intervals</h3>
          <p className="text-sm text-muted-foreground">
            Total: {formatDuration(totalDuration)}
          </p>
        </div>
        <Button onClick={addInterval} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Interval
        </Button>
      </div>

      <div className="space-y-3">
        {intervals.map((interval, index) => {
          const intervalDuration = interval.duration || 0
          const rounds = interval.rounds || 1
          const totalIntervalDuration = intervalDuration * rounds

          return (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Interval {index + 1}</CardTitle>
                  <Button
                    onClick={() => removeInterval(index)}
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor={`label-${index}`}>Label</Label>
                  <Input
                    id={`label-${index}`}
                    value={interval.label || ''}
                    onChange={(e) => updateInterval(index, { label: e.target.value })}
                    placeholder="e.g., Warmup, Sprint, Rest"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor={`duration-${index}`}>Duration (seconds)</Label>
                    <Input
                      id={`duration-${index}`}
                      type="number"
                      min="1"
                      value={interval.duration || ''}
                      onChange={(e) => updateInterval(index, { 
                        duration: parseInt(e.target.value) || 0 
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`rounds-${index}`}>Rounds</Label>
                    <Input
                      id={`rounds-${index}`}
                      type="number"
                      min="1"
                      value={interval.rounds || 1}
                      onChange={(e) => updateInterval(index, { 
                        rounds: parseInt(e.target.value) || 1 
                      })}
                    />
                  </div>
                </div>

                {interval.distance !== undefined && (
                  <div className="space-y-2">
                    <Label htmlFor={`distance-${index}`}>Distance (optional)</Label>
                    <Input
                      id={`distance-${index}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={interval.distance || ''}
                      onChange={(e) => updateInterval(index, { 
                        distance: parseFloat(e.target.value) || null 
                      })}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {formatDuration(totalIntervalDuration)}
                  </Badge>
                  {rounds > 1 && (
                    <span className="text-xs text-muted-foreground">
                      {rounds} × {formatDuration(intervalDuration)}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {intervals.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              No intervals added yet
            </p>
            <Button onClick={addInterval} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add First Interval
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

