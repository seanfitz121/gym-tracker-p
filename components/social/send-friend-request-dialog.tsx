'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface SendFriendRequestDialogProps {
  onRequestSent?: () => void
}

export function SendFriendRequestDialog({ onRequestSent }: SendFriendRequestDialogProps) {
  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendRequest = async () => {
    if (!username.trim()) {
      toast.error('Please enter a username')
      return
    }

    setLoading(true)
    try {
      // First, search for user by username
      const searchRes = await fetch(`/api/users/search?q=${encodeURIComponent(username.trim())}`)
      if (!searchRes.ok) throw new Error('Failed to search for user')
      
      const searchData = await searchRes.json()
      if (!searchData.users || searchData.users.length === 0) {
        toast.error(`No user found with username "${username}"`)
        return
      }

      const targetUser = searchData.users[0]

      // Send friend request
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_user_id: targetUser.user_id })
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to send friend request')
        return
      }

      toast.success(`Friend request sent to @${targetUser.username}!`)

      setUsername('')
      setOpen(false)
      onRequestSent?.()
    } catch (error) {
      console.error('Error sending friend request:', error)
      toast.error('Failed to send friend request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Friend
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Friend Request</DialogTitle>
          <DialogDescription>
            Enter the username of the person you'd like to add as a friend
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !loading) {
                  handleSendRequest()
                }
              }}
              disabled={loading}
            />
          </div>
          <Button
            onClick={handleSendRequest}
            disabled={loading || !username.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Request'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

