'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Activity, Timer, PenTool, Play } from 'lucide-react'
import { ManualCardioEntry } from './manual-cardio-entry'
import { CardioTimer } from './cardio-timer'

interface CardioEntryCardProps {
  userId: string
}

export function CardioEntryCard({ userId }: CardioEntryCardProps) {
  const [mode, setMode] = useState<'manual' | 'timer' | null>(null)

  return (
    <Card className="border-l-4 border-l-red-600">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-red-600 dark:text-red-400" />
          <CardTitle className="text-base font-semibold">Cardio</CardTitle>
        </div>
        <CardDescription>Log your cardio sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          <Dialog open={mode === 'timer'} onOpenChange={(open) => !open && setMode(null)}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-1 h-auto py-3"
                onClick={() => setMode('timer')}
              >
                <Timer className="h-5 w-5" />
                <span className="text-xs">Timer</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md w-full p-0">
              <DialogHeader className="p-6 pb-4">
                <DialogTitle>Live Cardio Timer</DialogTitle>
              </DialogHeader>
              <CardioTimer userId={userId} onComplete={() => setMode(null)} />
            </DialogContent>
          </Dialog>

          <Dialog open={mode === 'manual'} onOpenChange={(open) => !open && setMode(null)}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-1 h-auto py-3"
                onClick={() => setMode('manual')}
              >
                <PenTool className="h-5 w-5" />
                <span className="text-xs">Manual</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Log Cardio Session</DialogTitle>
              </DialogHeader>
              <ManualCardioEntry userId={userId} onSuccess={() => setMode(null)} />
            </DialogContent>
          </Dialog>

        </div>
      </CardContent>
    </Card>
  )
}

