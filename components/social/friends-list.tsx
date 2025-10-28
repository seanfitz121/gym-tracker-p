'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, X, Check, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { RankBadge } from '@/components/ranks/rank-badge'

interface Friend {
  user_id: string
  display_name: string
  avatar_url?: string | null
  rank_code?: string
  weekly_xp: number
  current_streak: number
  top_pr?: {
    exercise_name: string
    weight: number
    weight_unit: string
    reps: number
  } | null
}

interface FriendRequest {
  id: string
  from_user: string
  to_user: string
  status: string
  from_profile?: {
    display_name: string
    avatar_url?: string | null
    rank_code?: string
  }
  to_profile?: {
    display_name: string
    avatar_url?: string | null
    rank_code?: string
  }
}

interface FriendsListProps {
  userId: string
  onCompare?: (friendId: string) => void
}

export function FriendsList({ userId, onCompare }: FriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([])
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchFriends = async () => {
    try {
      const res = await fetch('/api/friends/list')
      if (!res.ok) throw new Error('Failed to fetch friends')
      const data = await res.json()
      setFriends(data.friends || [])
    } catch (error) {
      console.error('Error fetching friends:', error)
      toast.error('Failed to load friends list')
    }
  }

  const fetchRequests = async () => {
    try {
      const [incomingRes, outgoingRes] = await Promise.all([
        fetch('/api/friends/request?type=incoming'),
        fetch('/api/friends/request?type=outgoing')
      ])

      if (incomingRes.ok) {
        const incomingData = await incomingRes.json()
        setIncomingRequests(incomingData.requests || [])
      }

      if (outgoingRes.ok) {
        const outgoingData = await outgoingRes.json()
        setOutgoingRequests(outgoingData.requests || [])
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    }
  }

  const acceptRequest = async (requestId: string) => {
    setActionLoading(requestId)
    try {
      const res = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId })
      })

      if (!res.ok) throw new Error('Failed to accept request')

      toast.success('Friend request accepted!')

      await Promise.all([fetchFriends(), fetchRequests()])
    } catch (error) {
      console.error('Error accepting request:', error)
      toast.error('Failed to accept friend request')
    } finally {
      setActionLoading(null)
    }
  }

  const rejectRequest = async (requestId: string) => {
    setActionLoading(requestId)
    try {
      const res = await fetch('/api/friends/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId })
      })

      if (!res.ok) throw new Error('Failed to reject request')

      toast.success('Friend request rejected')

      await fetchRequests()
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error('Failed to reject friend request')
    } finally {
      setActionLoading(null)
    }
  }

  const removeFriend = async (friendId: string) => {
    setActionLoading(friendId)
    try {
      const res = await fetch(`/api/friends/list?friend_id=${friendId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to remove friend')

      toast.success('Friend removed')

      await fetchFriends()
    } catch (error) {
      console.error('Error removing friend:', error)
      toast.error('Failed to remove friend')
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchFriends(), fetchRequests()])
      setLoading(false)
    }
    loadData()
  }, [])

  const filteredFriends = friends.filter(f =>
    f.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      {/* Incoming Requests */}
      {incomingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Friend Requests ({incomingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {incomingRequests.map(request => (
              <div key={request.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="flex-shrink-0">
                    <AvatarImage src={request.from_profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      {request.from_profile?.display_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{request.from_profile?.display_name}</p>
                    {request.from_profile?.rank_code && (
                      <div className="mt-1">
                        <RankBadge rankCode={request.from_profile.rank_code} size="sm" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 sm:flex-shrink-0">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => acceptRequest(request.id)}
                    disabled={actionLoading === request.id}
                    className="flex-1 sm:flex-initial h-9"
                  >
                    {actionLoading === request.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4 sm:mr-0 mr-1" />
                        <span className="sm:hidden">Accept</span>
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectRequest(request.id)}
                    disabled={actionLoading === request.id}
                    className="flex-1 sm:flex-initial h-9"
                  >
                    <X className="h-4 w-4 sm:mr-0 mr-1" />
                    <span className="sm:hidden">Reject</span>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Friends ({friends.length})
            </CardTitle>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredFriends.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {friends.length === 0 ? 'No friends yet' : 'No matching friends'}
            </p>
          ) : (
            filteredFriends.map(friend => (
              <div key={friend.user_id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="flex-shrink-0">
                    <AvatarImage src={friend.avatar_url || undefined} />
                    <AvatarFallback>
                      {friend.display_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{friend.display_name}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {friend.rank_code && (
                        <RankBadge rankCode={friend.rank_code} size="sm" />
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {friend.weekly_xp} XP
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {friend.current_streak}d
                      </Badge>
                    </div>
                    {friend.top_pr && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        PR: {friend.top_pr.exercise_name} - {friend.top_pr.weight}{friend.top_pr.weight_unit} × {friend.top_pr.reps}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 sm:flex-shrink-0">
                  {onCompare && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCompare(friend.user_id)}
                      className="flex-1 sm:flex-initial h-9"
                    >
                      Compare
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Remove ${friend.display_name} from friends?`)) {
                        removeFriend(friend.user_id)
                      }
                    }}
                    disabled={actionLoading === friend.user_id}
                    className="h-9 w-9 p-0 flex-shrink-0"
                  >
                    {actionLoading === friend.user_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Pending Outgoing Requests */}
      {outgoingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {outgoingRequests.map(request => (
                <div key={request.id} className="flex items-center justify-between text-sm p-2">
                  <span>{request.to_profile?.display_name}</span>
                  <Badge variant="outline">Pending</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

