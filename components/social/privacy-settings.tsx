'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Shield, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { FriendRequestPrivacy, PrivacySettings as PrivacySettingsType } from '@/lib/types'

interface PrivacySettingsProps {
  userId: string
}

export function PrivacySettings({ userId }: PrivacySettingsProps) {
  const [settings, setSettings] = useState<PrivacySettingsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings/privacy')
      if (!res.ok) throw new Error('Failed to fetch settings')
      const data = await res.json()
      setSettings(data.settings)
    } catch (error) {
      console.error('Error fetching privacy settings:', error)
      toast.error('Failed to load privacy settings')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: keyof PrivacySettingsType, value: any) => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings/privacy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value })
      })

      if (!res.ok) throw new Error('Failed to update setting')

      setSettings(prev => prev ? { ...prev, [key]: value } : null)

      toast.success('Privacy setting updated')
    } catch (error) {
      console.error('Error updating setting:', error)
      toast.error('Failed to update setting')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  if (loading || !settings) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy Settings
        </CardTitle>
        <CardDescription>
          Control who can see your profile and send you friend requests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Friend Requests Privacy */}
        <div className="space-y-2">
          <Label htmlFor="friend-requests">Who can send you friend requests?</Label>
          <Select
            value={settings.friend_requests}
            onValueChange={(value: FriendRequestPrivacy) => updateSetting('friend_requests', value)}
            disabled={saving}
          >
            <SelectTrigger id="friend-requests">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anyone">Anyone</SelectItem>
              <SelectItem value="friends_of_friends">Friends of Friends</SelectItem>
              <SelectItem value="nobody">Nobody</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            {settings.friend_requests === 'anyone' && 'Anyone can send you a friend request'}
            {settings.friend_requests === 'friends_of_friends' && 'Only people with mutual friends can send requests'}
            {settings.friend_requests === 'nobody' && 'You won\'t receive any friend requests'}
          </p>
        </div>

        {/* Global Leaderboard */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="global-leaderboard">Show on Global Leaderboard</Label>
            <p className="text-sm text-gray-500">
              Appear on public global leaderboards
            </p>
          </div>
          <Switch
            id="global-leaderboard"
            checked={settings.global_leaderboard === 'opt_in'}
            onCheckedChange={(checked) => 
              updateSetting('global_leaderboard', checked ? 'opt_in' : 'opt_out')
            }
            disabled={saving}
          />
        </div>

        {/* Gym Leaderboard */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="gym-leaderboard">Show on Gym Leaderboard</Label>
            <p className="text-sm text-gray-500">
              Appear on your gym's leaderboard
            </p>
          </div>
          <Switch
            id="gym-leaderboard"
            checked={settings.gym_leaderboard === 'opt_in'}
            onCheckedChange={(checked) => 
              updateSetting('gym_leaderboard', checked ? 'opt_in' : 'opt_out')
            }
            disabled={saving}
          />
        </div>

        {/* Public Profile */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="public-profile">Public Profile</Label>
            <p className="text-sm text-gray-500">
              Allow others to view your profile and stats
            </p>
          </div>
          <Switch
            id="public-profile"
            checked={settings.public_profile}
            onCheckedChange={(checked) => updateSetting('public_profile', checked)}
            disabled={saving}
          />
        </div>
      </CardContent>
    </Card>
  )
}

