'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Calendar, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'
import { SetExpiryDateDialog } from './set-expiry-date-dialog'
import { differenceInDays, format, parseISO, isPast } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface GymExpiryCardProps {
  userId: string
  expiryDate: string | null
}

export function GymExpiryCard({ userId, expiryDate: initialExpiryDate }: GymExpiryCardProps) {
  const [expiryDate, setExpiryDate] = useState<string | null>(initialExpiryDate)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Update local state when prop changes (e.g., after page refresh)
  useEffect(() => {
    setExpiryDate(initialExpiryDate)
  }, [initialExpiryDate])

  const handleExpiryDateSet = (newDate: string) => {
    setExpiryDate(newDate)
  }

  // If no expiry date is set, show CTA
  if (!expiryDate) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Gym Membership
          </CardTitle>
          <CardDescription>Track when your membership expires</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="w-full"
            variant="outline"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Set Expiry Date
          </Button>
        </CardContent>

        <SetExpiryDateDialog
          userId={userId}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onExpiryDateSet={handleExpiryDateSet}
        />
      </Card>
    )
  }

  // Calculate days remaining
  const expiry = parseISO(expiryDate)
  const today = new Date()
  const daysRemaining = differenceInDays(expiry, today)
  const isExpired = isPast(expiry) && daysRemaining < 0

  // Determine status and styling
  let statusColor = 'text-green-600 dark:text-green-400'
  let bgColor = 'bg-green-50 dark:bg-green-950/30'
  let borderColor = 'border-green-200 dark:border-green-900'
  let progressColor = 'bg-green-600'
  let statusText = 'Active'
  let statusIcon = <CheckCircle className="h-4 w-4" />

  if (isExpired) {
    statusColor = 'text-red-600 dark:text-red-400'
    bgColor = 'bg-red-50 dark:bg-red-950/30'
    borderColor = 'border-red-200 dark:border-red-900'
    progressColor = 'bg-red-600'
    statusText = 'Expired'
    statusIcon = <AlertTriangle className="h-4 w-4" />
  } else if (daysRemaining <= 3) {
    statusColor = 'text-red-600 dark:text-red-400'
    bgColor = 'bg-red-50 dark:bg-red-950/30'
    borderColor = 'border-red-200 dark:border-red-900'
    progressColor = 'bg-red-600'
    statusText = 'Critical'
    statusIcon = <AlertTriangle className="h-4 w-4" />
  } else if (daysRemaining <= 10) {
    statusColor = 'text-amber-600 dark:text-amber-400'
    bgColor = 'bg-amber-50 dark:bg-amber-950/30'
    borderColor = 'border-amber-200 dark:border-amber-900'
    progressColor = 'bg-amber-600'
    statusText = 'Expiring Soon'
    statusIcon = <AlertTriangle className="h-4 w-4" />
  }

  // Calculate progress (assuming 1 year membership)
  const membershipStart = new Date(expiry)
  membershipStart.setFullYear(membershipStart.getFullYear() - 1)
  const totalDays = differenceInDays(expiry, membershipStart)
  const elapsedDays = differenceInDays(today, membershipStart)
  const progressPercentage = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100)

  return (
    <>
      <Card className={`${borderColor} ${bgColor}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className={`h-5 w-5 ${statusColor}`} />
              Gym Membership
            </CardTitle>
            <Badge variant="outline" className={`${statusColor} border-current`}>
              {statusIcon}
              <span className="ml-1">{statusText}</span>
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Days Remaining */}
          <div className="text-center py-4">
            {isExpired ? (
              <>
                <p className={`text-3xl font-bold ${statusColor}`}>Expired</p>
                <p className="text-sm text-muted-foreground mt-1">
                  on {format(expiry, 'MMM d, yyyy')}
                </p>
              </>
            ) : (
              <>
                <p className={`text-4xl font-bold ${statusColor}`}>{daysRemaining}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {daysRemaining === 1 ? 'day' : 'days'} remaining
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Expires {format(expiry, 'MMM d, yyyy')}
                </p>
              </>
            )}
          </div>

          {/* Progress Bar */}
          {!isExpired && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Time elapsed</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="flex-1"
              variant={isExpired || daysRemaining <= 10 ? 'default' : 'outline'}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {isExpired ? 'Renew' : 'Update Date'}
            </Button>
            <Button
              onClick={() => setIsDialogOpen(true)}
              variant="outline"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>

          {/* Warning Messages */}
          {!isExpired && daysRemaining <= 10 && (
            <div className={`text-xs ${statusColor} text-center p-2 rounded-lg ${bgColor} border ${borderColor}`}>
              {daysRemaining <= 3 
                ? '⚠️ Your membership expires in 3 days or less!'
                : '⏰ Your membership is expiring soon. Consider renewing!'}
            </div>
          )}
        </CardContent>
      </Card>

      <SetExpiryDateDialog
        userId={userId}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onExpiryDateSet={handleExpiryDateSet}
        currentExpiryDate={expiryDate}
      />
    </>
  )
}

