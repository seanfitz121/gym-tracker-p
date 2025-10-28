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
import { Dumbbell, Users, LogOut, Plus, Loader2, Check, X } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { RankBadge } from '@/components/ranks/rank-badge'
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

interface PendingRequest {
  user_id: string
  username?: string | null
  display_name: string
  avatar_url?: string | null
  rank_code?: string
  joined_at: string
}

interface GymMember {
  user_id: string
  joined_at: string
  opt_in: boolean
  is_approved: boolean
  profile: {
    user_id: string
    display_name: string
    avatar_url?: string | null
    rank_code?: string | null
  } | null
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
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [membersDialogOpen, setMembersDialogOpen] = useState(false)
  const [members, setMembers] = useState<GymMember[]>([])
  const [membersLoading, setMembersLoading] = useState(false)

  const fetchCurrentGym = async (skipPendingRequests = false) => {
    try {
      // Get user's gym membership
      const res = await fetch('/api/gym/my-gym')
      if (res.ok) {
        const data = await res.json()
        if (data.gym) {
          setCurrentGym(data.gym)
          onGymChange?.(data.gym.code)
          
          // If user is owner, fetch pending requests (unless explicitly skipped)
          if (data.gym.user_is_owner && !skipPendingRequests) {
            fetchPendingRequests(data.gym.code)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching gym:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingRequests = async (gymCode: string) => {
    setRequestsLoading(true)
    try {
      const res = await fetch(`/api/gym/${gymCode}/pending`)
      if (res.ok) {
        const data = await res.json()
        setPendingRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error)
    } finally {
      setRequestsLoading(false)
    }
  }

  const fetchMembers = async (gymCode: string) => {
    setMembersLoading(true)
    try {
      const res = await fetch(`/api/gym/${gymCode}/members`)
      if (res.ok) {
        const data = await res.json()
        setMembers(data.members || [])
      }
    } catch (error) {
      console.error('Error fetching members:', error)
      toast.error('Failed to load gym members')
    } finally {
      setMembersLoading(false)
    }
  }

  const handleViewMembers = () => {
    if (currentGym) {
      fetchMembers(currentGym.code)
      setMembersDialogOpen(true)
    }
  }

  const handleApproveReject = async (userId: string, action: 'approve' | 'reject') => {
    if (!currentGym) return

    // Store the request being processed in case we need to restore it on error
    const requestToProcess = pendingRequests.find(req => req.user_id === userId)
    
    try {
      // Optimistically remove the request from UI immediately
      setPendingRequests(prev => prev.filter(req => req.user_id !== userId))
      
      const res = await fetch(`/api/gym/${currentGym.code}/pending`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, action })
      })

      if (!res.ok) throw new Error('Failed to process request')

      toast.success(action === 'approve' ? 'Member approved!' : 'Request rejected')
      
      // Refresh the gym data to update member count, but skip refetching pending requests
      // (we already updated them optimistically above)
      if (action === 'approve') {
        fetchCurrentGym(true) // Skip pending requests refetch
      }
    } catch (error) {
      console.error('Error processing request:', error)
      toast.error('Failed to process request')
      
      // Restore the request to UI on error
      if (requestToProcess) {
        setPendingRequests(prev => [...prev, requestToProcess])
      }
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
      {/* Pending Requests (Owner Only) */}
      {currentGym?.user_is_owner && pendingRequests.length > 0 && (
        <Card className="border-yellow-500 dark:border-yellow-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
              <Users className="h-5 w-5" />
              Pending Join Requests ({pendingRequests.length})
            </CardTitle>
            <CardDescription>
              Review and approve or reject members wanting to join your gym
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {requestsLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : (
              pendingRequests.map(request => (
                <div
                  key={request.user_id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{request.display_name}</p>
                    {request.username && (
                      <p className="text-sm text-gray-500 truncate">@{request.username}</p>
                    )}
                  </div>
                  <div className="flex gap-2 sm:flex-shrink-0">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleApproveReject(request.user_id, 'approve')}
                      className="flex-1 sm:flex-initial h-9"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApproveReject(request.user_id, 'reject')}
                      className="flex-1 sm:flex-initial h-9"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

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
            <button 
              onClick={handleViewMembers}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors w-full text-left"
            >
              <Users className="h-4 w-4" />
              <span>{currentGym.member_count} members</span>
            </button>
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

      {/* Members Dialog */}
      <Dialog open={membersDialogOpen} onOpenChange={setMembersDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gym Members
            </DialogTitle>
            <DialogDescription>
              {currentGym?.name} members ({members.length})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {membersLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : members.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No members yet</p>
            ) : (
              members.map(member => (
                <div
                  key={member.user_id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      {member.profile?.display_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{member.profile?.display_name || 'Unknown'}</p>
                    {member.profile?.rank_code && (
                      <div className="mt-1">
                        <RankBadge rankCode={member.profile.rank_code} size="sm" />
                      </div>
                    )}
                  </div>
                  {member.user_id === currentGym?.owner_id && (
                    <Badge variant="secondary">Owner</Badge>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
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

