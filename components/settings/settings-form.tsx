'use client'

import { useState, useRef, useEffect } from 'react'
import { useSettingsStore } from '@/lib/store/settings-store'
import { useProfile, useUpdateProfile, useUploadAvatar } from '@/lib/hooks/use-profile'
import { useIsAdmin } from '@/lib/hooks/use-admin'
import { useTheme } from '@/lib/hooks/use-theme'
import { AdminAnnouncementsManager } from '@/components/announcements/admin-announcements-manager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { User, Upload, Mail, MessageSquare, ExternalLink, Sun, Moon, Monitor, Volume2 } from 'lucide-react'
import { toast } from 'sonner'

interface SettingsFormProps {
  userId: string
}

export function SettingsForm({ userId }: SettingsFormProps) {
  const { defaultWeightUnit, defaultRestTimer, chartSmoothing, soundsEnabled, updateSettings } = useSettingsStore()
  const { profile, loading: profileLoading, refresh } = useProfile(userId)
  const { updateProfile, loading: updateLoading } = useUpdateProfile()
  const { uploadAvatar, uploading } = useUploadAvatar()
  const { isAdmin, loading: adminLoading } = useIsAdmin(userId)
  const { theme, setTheme } = useTheme()

  const [displayName, setDisplayName] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize display name when profile loads
  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name)
    } else if (profile && !profile.display_name) {
      // Profile exists but no display name set yet - keep field empty
      setDisplayName('')
    }
  }, [profile?.display_name])

  const handleWeightUnitChange = (value: 'kg' | 'lb') => {
    updateSettings({ defaultWeightUnit: value })
    toast.success('Weight unit updated')
  }

  const handleRestTimerChange = (value: string) => {
    updateSettings({ defaultRestTimer: parseInt(value) })
    toast.success('Default rest timer updated')
  }

  const handleChartSmoothingChange = (value: 'off' | 'low' | 'high') => {
    updateSettings({ chartSmoothing: value })
    toast.success('Chart smoothing updated')
  }

  const handleThemeChange = (value: 'light' | 'dark' | 'system') => {
    setTheme(value)
    toast.success('Theme updated')
  }

  const handleSoundsToggle = (checked: boolean) => {
    updateSettings({ soundsEnabled: checked })
    toast.success(checked ? 'Sounds enabled' : 'Sounds disabled')
  }

  const handleUpdateDisplayName = async () => {
    if (!displayName.trim()) {
      toast.error('Nickname cannot be empty')
      return
    }

    const result = await updateProfile(userId, { display_name: displayName.trim() })
    if (result) {
      toast.success('Nickname updated')
      setIsEditingName(false)
      refresh()
      // Notify other components that profile was updated
      setTimeout(() => {
        window.dispatchEvent(new Event('profile-updated'))
      }, 100)
    } else {
      toast.error('Failed to update nickname')
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }

    const avatarUrl = await uploadAvatar(userId, file)
    if (avatarUrl) {
      const result = await updateProfile(userId, { avatar_url: avatarUrl })
      if (result) {
        toast.success('Profile picture updated')
        refresh()
        // Force a small delay to ensure profile is refreshed in header
        setTimeout(() => {
          window.dispatchEvent(new Event('profile-updated'))
        }, 100)
      } else {
        toast.error('Failed to update profile picture')
      }
    } else {
      toast.error('Failed to upload image')
    }
  }

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return 'U'
  }

  return (
    <div className="space-y-6">
      {/* Admin Announcements (Admin Only) */}
      {isAdmin && !adminLoading && (
        <AdminAnnouncementsManager />
      )}

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Customize your profile appearance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={(profile as any)?.avatar_url || undefined} />
              <AvatarFallback className="text-lg">
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
                disabled={uploading || updateLoading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Change Picture'}
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG or GIF. Max 2MB.
              </p>
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label>Nickname</Label>
            <div className="flex gap-2">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your nickname"
                className="flex-1"
                disabled={updateLoading || profileLoading}
                onFocus={() => setIsEditingName(true)}
              />
              {isEditingName && (
                <Button
                  onClick={handleUpdateDisplayName}
                  size="sm"
                  disabled={updateLoading || !displayName.trim()}
                >
                  Save
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize the look and feel of the app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme */}
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    <span>Light</span>
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <span>Dark</span>
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <span>System</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {theme === 'system' 
                ? 'Theme will match your device settings'
                : `Using ${theme} mode`
              }
            </p>
          </div>

          {/* Sound Effects */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Sound Effects
                </Label>
                <p className="text-xs text-muted-foreground">
                  Play sounds for workouts, rest timer, and actions
                </p>
              </div>
              <Switch
                checked={soundsEnabled}
                onCheckedChange={handleSoundsToggle}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workout Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Workout Settings</CardTitle>
          <CardDescription>
            Customize your workout tracking experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Weight Unit */}
          <div className="space-y-2">
            <Label>Default Weight Unit</Label>
            <Select value={defaultWeightUnit} onValueChange={handleWeightUnitChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">Kilograms (kg)</SelectItem>
                <SelectItem value="lb">Pounds (lb)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rest Timer */}
          <div className="space-y-2">
            <Label>Default Rest Timer</Label>
            <Select value={defaultRestTimer.toString()} onValueChange={handleRestTimerChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">60 seconds</SelectItem>
                <SelectItem value="90">90 seconds</SelectItem>
                <SelectItem value="120">2 minutes</SelectItem>
                <SelectItem value="180">3 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Chart Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Chart Settings</CardTitle>
          <CardDescription>
            Adjust how your progress charts are displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chart Smoothing */}
          <div className="space-y-2">
            <Label>Chart Smoothing</Label>
            <Select value={chartSmoothing} onValueChange={handleChartSmoothingChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="off">Off (Show all data points)</SelectItem>
                <SelectItem value="low">Low (Slight smoothing)</SelectItem>
                <SelectItem value="high">High (More smoothing)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Support & Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Support & Contact</CardTitle>
          <CardDescription>
            Need help? Get in touch with us
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <a
              href="mailto:sean@sfweb.ie"
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <Mail className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-sm">Email Support</p>
                <p className="text-xs text-gray-500">sean@sfweb.ie</p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </a>

            <a
              href="https://github.com/seanfitz121"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <MessageSquare className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-sm">Report an Issue</p>
                <p className="text-xs text-gray-500">Open a GitHub issue</p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </a>
          </div>

          <div className="pt-4 border-t">
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p className="font-medium">App Information</p>
              <p className="text-xs">Version: 1.0.0</p>
              <p className="text-xs">Build: MVP</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

