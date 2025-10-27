'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Layers, Zap, TrendingDown } from 'lucide-react'
import type { BlockType } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CreateBlockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateBlock: (blockType: BlockType, rounds: number, restBetweenRounds: number) => void
}

const BLOCK_TYPES = [
  {
    type: 'superset' as BlockType,
    icon: Layers,
    title: 'Superset',
    description: 'Perform 2 exercises back-to-back with minimal rest',
    color: 'border-purple-500 hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    type: 'triset' as BlockType,
    icon: Layers,
    title: 'Tri-Set',
    description: 'Perform 3 exercises consecutively',
    color: 'border-indigo-500 hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    type: 'giant' as BlockType,
    icon: Zap,
    title: 'Giant Set',
    description: 'Perform 4+ exercises in a circuit',
    color: 'border-blue-500 hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    type: 'drop' as BlockType,
    icon: TrendingDown,
    title: 'Drop Set',
    description: 'Single exercise with decreasing weight',
    color: 'border-orange-500 hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
]

export function CreateBlockDialog({ open, onOpenChange, onCreateBlock }: CreateBlockDialogProps) {
  const [selectedType, setSelectedType] = useState<BlockType>('superset')
  const [rounds, setRounds] = useState(3)
  const [restBetweenRounds, setRestBetweenRounds] = useState(60)

  const handleCreate = () => {
    onCreateBlock(selectedType, rounds, restBetweenRounds)
    onOpenChange(false)
    // Reset for next time
    setSelectedType('superset')
    setRounds(3)
    setRestBetweenRounds(60)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Exercise Block</DialogTitle>
          <DialogDescription>
            Choose a block type to group exercises together for supersets, tri-sets, or drop sets
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Block Type Selection */}
          <div className="space-y-3">
            <Label>Block Type</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {BLOCK_TYPES.map((blockType) => {
                const Icon = blockType.icon
                const isSelected = selectedType === blockType.type
                
                return (
                  <Card
                    key={blockType.type}
                    className={cn(
                      'cursor-pointer transition-all',
                      blockType.color,
                      isSelected && 'ring-2 ring-offset-2 ring-blue-500'
                    )}
                    onClick={() => setSelectedType(blockType.type)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn('p-2 rounded-lg bg-white dark:bg-gray-950', blockType.iconColor)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-base">{blockType.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <CardDescription className="text-xs">
                        {blockType.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rounds">Number of Rounds</Label>
              <Input
                id="rounds"
                type="number"
                value={rounds}
                onChange={(e) => setRounds(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                max={10}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                How many rounds/sets to complete
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rest">Rest Between Rounds (seconds)</Label>
              <Input
                id="rest"
                type="number"
                value={restBetweenRounds}
                onChange={(e) => setRestBetweenRounds(Math.max(0, parseInt(e.target.value) || 0))}
                min={0}
                max={600}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Rest time after completing each round
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Tip:</strong> After creating the block, you'll be able to add exercises to it. 
              {selectedType === 'drop' && ' For drop sets, add the same exercise multiple times with decreasing weights.'}
              {selectedType !== 'drop' && ' Add multiple exercises to perform them back-to-back.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>
              Create Block
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

