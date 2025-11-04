'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useNotifications } from '@/lib/hooks/use-notifications'
import { usePushSubscription } from '@/lib/hooks/use-push-subscription'
import { Bell, BellOff, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { NotificationPreferences } from '@/lib/types/notifications'

export function NotificationSettings() {
  const { preferences, updatePreferences, loading: prefsLoading } = useNotifications()
  const {
    isSupported,
    permission,
    subscription,
    loading: pushLoading,
    subscribe,
    unsubscribe,
  } = usePushSubscription()

  const [updating, setUpdating] = useState(false)

  const handleTogglePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return

    setUpdating(true)
    try {
      await updatePreferences({ [key]: value })
      toast.success('Notification preference updated')
    } catch (error) {
      toast.error('Failed to update preference')
    } finally {
      setUpdating(false)
    }
  }

  const handleTogglePush = async () => {
    if (!preferences) return

    setUpdating(true)
    try {
      if (subscription) {
        // Unsubscribe
        const success = await unsubscribe()
        if (success) {
          await updatePreferences({ push_enabled: false })
          toast.success('Push notifications disabled')
        }
      } else {
        // Subscribe
        const success = await subscribe()
        if (success) {
          await updatePreferences({ push_enabled: true })
          toast.success('Push notifications enabled!')
        } else {
          toast.error('Failed to enable push notifications')
        }
      }
    } catch (error) {
      toast.error('Failed to update push notifications')
    } finally {
      setUpdating(false)
    }
  }

  if (prefsLoading || pushLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Loading notification settings...
        </CardContent>
      </Card>
    )
  }

  if (!preferences) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-red-600">
          Failed to load notification preferences
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Receive notifications even when the app is closed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isSupported ? (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <BellOff className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Push notifications are not supported in your browser
              </p>
            </div>
          ) : permission === 'denied' ? (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-600">
                  Notifications blocked
                </p>
                <p className="text-xs text-red-600/80 mt-1">
                  Enable notifications in your browser settings to receive push notifications
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-enabled">Enable Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  {subscription
                    ? 'Push notifications are active'
                    : 'Click to enable push notifications'}
                </p>
              </div>
              {subscription ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <Button
                    onClick={handleTogglePush}
                    variant="outline"
                    size="sm"
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : 'Disable'}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleTogglePush}
                  disabled={updating || permission === ('denied' as NotificationPermission)}
                  size="sm"
                >
                  {updating ? 'Enabling...' : 'Enable'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Choose which notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="friend-requests">Friend Requests</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone sends you a friend request
              </p>
            </div>
            <Switch
              id="friend-requests"
              checked={preferences.friend_requests}
              onCheckedChange={(checked) =>
                handleTogglePreference('friend_requests', checked)
              }
              disabled={updating}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="workout-reminders">Workout Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminded if you haven't logged a workout in 7 days
              </p>
            </div>
            <Switch
              id="workout-reminders"
              checked={preferences.workout_reminders}
              onCheckedChange={(checked) =>
                handleTogglePreference('workout_reminders', checked)
              }
              disabled={updating}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="community-interactions">Community Interactions</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone likes or comments on your posts
              </p>
            </div>
            <Switch
              id="community-interactions"
              checked={preferences.community_interactions}
              onCheckedChange={(checked) =>
                handleTogglePreference('community_interactions', checked)
              }
              disabled={updating}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="patch-notes">Patch Notes</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new updates are released
              </p>
            </div>
            <Switch
              id="patch-notes"
              checked={preferences.patch_notes}
              onCheckedChange={(checked) =>
                handleTogglePreference('patch_notes', checked)
              }
              disabled={updating}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="gym-expiry">Gym Membership Expiry</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when your gym membership is expiring (3 days before)
              </p>
            </div>
            <Switch
              id="gym-expiry"
              checked={preferences.gym_expiry}
              onCheckedChange={(checked) =>
                handleTogglePreference('gym_expiry', checked)
              }
              disabled={updating}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

