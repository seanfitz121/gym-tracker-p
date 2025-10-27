'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, Check, X, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AntiCheatFlag {
  id: string
  user_id: string
  flag_type: string
  severity: 'low' | 'medium' | 'high'
  status: 'pending' | 'cleared' | 'confirmed'
  details: any
  flagged_at: string
  reviewed_at?: string
  reviewed_by?: string
  notes?: string
  user_profile?: {
    display_name: string
    avatar_url?: string | null
  }
}

export function AdminModeration() {
  const [flags, setFlags] = useState<AntiCheatFlag[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'pending' | 'all'>('pending')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState<{ [key: string]: string }>({})

  const fetchFlags = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/anti-cheat-flags?status=${statusFilter}`)
      if (!res.ok) throw new Error('Failed to fetch flags')
      const data = await res.json()
      setFlags(data.flags || [])
    } catch (error) {
      console.error('Error fetching flags:', error)
      toast.error('Failed to load flags')
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (flagId: string, action: 'clear' | 'confirm') => {
    setActionLoading(flagId)
    try {
      const res = await fetch('/api/admin/anti-cheat-flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flag_id: flagId,
          action,
          notes: reviewNotes[flagId] || ''
        })
      })

      if (!res.ok) throw new Error('Failed to review flag')

      toast.success(`Flag ${action === 'clear' ? 'cleared' : 'confirmed'}`)

      await fetchFlags()
      setReviewNotes(prev => {
        const newNotes = { ...prev }
        delete newNotes[flagId]
        return newNotes
      })
    } catch (error) {
      console.error('Error reviewing flag:', error)
      toast.error('Failed to review flag')
    } finally {
      setActionLoading(null)
    }
  }

  useEffect(() => {
    fetchFlags()
  }, [statusFilter])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Anti-Cheat Moderation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="pending">
              Pending ({flags.filter(f => f.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="all">All Flags</TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter} className="space-y-4">
            {flags.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                {statusFilter === 'pending' ? 'No pending flags' : 'No flags found'}
              </div>
            ) : (
              flags.map(flag => (
                <div
                  key={flag.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium">{flag.user_profile?.display_name || 'Unknown User'}</p>
                        <Badge variant={getSeverityColor(flag.severity)}>
                          {flag.severity}
                        </Badge>
                        <Badge variant="outline">{flag.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {flag.flag_type}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Flagged {new Date(flag.flagged_at).toLocaleDateString()}
                      </p>
                    </div>
                    {flag.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReview(flag.id, 'clear')}
                          disabled={actionLoading === flag.id}
                        >
                          {actionLoading === flag.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Clear
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReview(flag.id, 'confirm')}
                          disabled={actionLoading === flag.id}
                        >
                          {actionLoading === flag.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Confirm
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  {flag.details && (
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-sm">
                      <p className="font-medium mb-2">Details:</p>
                      {flag.details.flags && (
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          {flag.details.flags.map((f: string, i: number) => (
                            <li key={i} className="text-gray-600 dark:text-gray-400">{f}</li>
                          ))}
                        </ul>
                      )}
                      {flag.details.workout_summary && (
                        <div className="mt-2 text-xs text-gray-500">
                          <p>Sets: {flag.details.workout_summary.total_sets}</p>
                          <p>Blocks: {flag.details.workout_summary.total_blocks}</p>
                          <p>Duration: {Math.round(flag.details.workout_summary.duration_ms / 60000)}min</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Review Notes */}
                  {flag.status === 'pending' && (
                    <Textarea
                      placeholder="Add review notes..."
                      value={reviewNotes[flag.id] || ''}
                      onChange={(e) => setReviewNotes(prev => ({ ...prev, [flag.id]: e.target.value }))}
                      rows={2}
                      className="text-sm"
                    />
                  )}

                  {/* Existing Notes */}
                  {flag.notes && (
                    <div className="text-sm">
                      <p className="font-medium">Review Notes:</p>
                      <p className="text-gray-600 dark:text-gray-400">{flag.notes}</p>
                      {flag.reviewed_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          Reviewed {new Date(flag.reviewed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

