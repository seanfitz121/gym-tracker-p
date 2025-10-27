'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Dumbbell, Users, LogOut, Plus, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'

interface Gym {
  code: string
  name: string
  description?: string
  owner_id: string
  is_verified: boolean
  require_approval: boolean
  member_count: number
  user_is_member: boolean
  user_is_owner: boolean
}

interface GymManagerProps {
  userId: string
  onGymChange?: (gymCode: string | null) => void
}

export function GymManager({ userId, onGymChange }: GymManagerProps) {
  const [currentGym, setCurrentGym] = useState<Gym | null>(null)
  const [loading, setLoading] = useState(true)
  const [joinCode, setJoinCode] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const fetchCurrentGym = async () => {
    try {
      // Get user's gym membership
      const res = await fetch('/api/gym/my-gym')
      if (res.ok) {
        const data = await res.json()
        if (data.gym) {
          setCurrentGym(data.gym)
          onGymChange?.(data.gym.code)
        }
      }
    } catch (error) {
      console.error('Error fetching gym:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrentGym()
  }, [])

  const handleJoinGym = async () => {
    if (!joinCode.trim()) {
      toast.error('Please enter a gym code')
      return
    }

    setJoinLoading(true)
    try {
      const res = await fetch('/api/gym/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gym_code: joinCode.trim().toUpperCase() })
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to join gym')
        return
      }

      toast.success(data.requires_approval 
        ? 'Request sent! Waiting for gym owner approval.'
        : 'Successfully joined gym!')

      setJoinCode('')
      await fetchCurrentGym()
    } catch (error) {
      console.error('Error joining gym:', error)
      toast.error('Failed to join gym')
    } finally {
      setJoinLoading(false)
    }
  }

  const handleLeaveGym = async () => {
    if (!currentGym) return

    if (!confirm(`Leave ${currentGym.name}?`)) return

    try {
      const res = await fetch('/api/gym/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gym_code: currentGym.code })
      })

      if (!res.ok) throw new Error('Failed to leave gym')

      toast.success('Left gym successfully')

      setCurrentGym(null)
      onGymChange?.(null)
    } catch (error) {
      console.error('Error leaving gym:', error)
      toast.error('Failed to leave gym')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {currentGym ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                <CardTitle>{currentGym.name}</CardTitle>
                {currentGym.is_verified && (
                  <Badge variant="secondary">
                    <Check className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              {currentGym.user_is_owner && (
                <Badge>Owner</Badge>
              )}
            </div>
            <CardDescription>
              {currentGym.description || 'No description'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Users className="h-4 w-4" />
              <span>{currentGym.member_count} members</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Gym Code:</span>
              <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{currentGym.code}</code>
            </div>
            {!currentGym.user_is_owner && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLeaveGym}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Leave Gym
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Join a Gym</CardTitle>
            <CardDescription>
              Join a gym to compete on gym leaderboards with your gym mates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gym-code">Gym Code</Label>
              <div className="flex gap-2">
                <Input
                  id="gym-code"
                  placeholder="Enter gym code..."
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !joinLoading) {
                      handleJoinGym()
                    }
                  }}
                  disabled={joinLoading}
                />
                <Button onClick={handleJoinGym} disabled={joinLoading || !joinCode.trim()}>
                  {joinLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Join'
                  )}
                </Button>
              </div>
            </div>
            <div className="text-center text-sm text-gray-500">or</div>
            <CreateGymDialog
              userId={userId}
              open={createDialogOpen}
              onOpenChange={setCreateDialogOpen}
              onGymCreated={fetchCurrentGym}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface CreateGymDialogProps {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onGymCreated: () => void
}

function CreateGymDialog({ userId, open, onOpenChange, onGymCreated }: CreateGymDialogProps) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [requireApproval, setRequireApproval] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!code.trim() || !name.trim()) {
      toast.error('Gym code and name are required')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/gym/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          description: description.trim() || undefined,
          require_approval: requireApproval
        })
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to create gym')
        return
      }

      toast.success('Gym created successfully!')

      setCode('')
      setName('')
      setDescription('')
      setRequireApproval(false)
      onOpenChange(false)
      onGymCreated()
    } catch (error) {
      console.error('Error creating gym:', error)
      toast.error('Failed to create gym')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create Your Own Gym
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a Gym</DialogTitle>
          <DialogDescription>
            Create a gym and invite your friends to compete on a private leaderboard
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="create-code">Gym Code *</Label>
            <Input
              id="create-code"
              placeholder="MYGYM2024"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={loading}
              maxLength={20}
            />
            <p className="text-xs text-gray-500">3-20 uppercase letters & numbers only</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-name">Gym Name *</Label>
            <Input
              id="create-name"
              placeholder="My Awesome Gym"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-description">Description (optional)</Label>
            <Textarea
              id="create-description"
              placeholder="Tell people about your gym..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="require-approval">Require member approval</Label>
            <Switch
              id="require-approval"
              checked={requireApproval}
              onCheckedChange={setRequireApproval}
              disabled={loading}
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={loading || !code.trim() || !name.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Gym'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

