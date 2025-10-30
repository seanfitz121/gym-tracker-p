'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Eye, EyeOff, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { ModerationQueueItem } from '@/lib/types/community'
import { toast } from 'sonner'

export function ModerationDashboard() {
  const router = useRouter()
  const [reports, setReports] = useState<ModerationQueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'open' | 'reviewed' | 'dismissed' | 'actioned'>('open')

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/community/reports?status=${status}`)
        
        if (res.status === 403) {
          toast.error('Unauthorized')
          router.push('/app')
          return
        }

        const data = await res.json()
        setReports(data.reports || [])
      } catch (error) {
        console.error('Error fetching reports:', error)
        toast.error('Failed to load reports')
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [status, router])

  const handleAction = async (reportId: string, action: 'hide' | 'delete' | 'dismiss') => {
    try {
      const res = await fetch(`/api/admin/community/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (res.ok) {
        toast.success(`Action completed: ${action}`)
        // Remove from list
        setReports(prev => prev.filter(r => r.report.id !== reportId))
      } else {
        toast.error('Failed to perform action')
      }
    } catch (error) {
      toast.error('Failed to perform action')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Community Moderation</h1>
          <p className="text-muted-foreground">
            Review and take action on reported content
          </p>
        </div>

        <Tabs value={status} onValueChange={(v) => setStatus(v as any)}>
          <TabsList className="mb-6">
            <TabsTrigger value="open" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Open
            </TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
            <TabsTrigger value="actioned">Actioned</TabsTrigger>
            <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
          </TabsList>

          <TabsContent value={status}>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                <p className="mt-4 text-muted-foreground">Loading reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <p className="text-xl font-semibold mb-2">All clear!</p>
                  <p className="text-muted-foreground">
                    No {status} reports at the moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reports.map((item) => (
                  <Card key={item.report.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg mb-2">
                            {item.report.target_type === 'post' ? 'Post' : 'Comment'} Report
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={item.reporter.username} />
                                <AvatarFallback>
                                  {item.reporter.username[0]?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span>Reported by {item.reporter.username}</span>
                            </div>
                            <span>
                              {formatDistanceToNow(new Date(item.report.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline">{item.report.status}</Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Report reason */}
                      <div>
                        <p className="text-sm font-semibold mb-1">Reason:</p>
                        <p className="text-sm">{item.report.reason}</p>
                        {item.report.details && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.report.details}
                          </p>
                        )}
                      </div>

                      {/* Reported content */}
                      {item.target && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                          <div className="flex items-center gap-2 mb-2">
                            {item.target_author && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={item.target_author.username} />
                                  <AvatarFallback>
                                    {item.target_author.username[0]?.toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span>By {item.target_author.username}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-sm">
                            {'title' in item.target && item.target.title && (
                              <p className="font-semibold mb-1">{item.target.title}</p>
                            )}
                            <p className="whitespace-pre-wrap line-clamp-4">
                              {item.target.body}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {item.report.status === 'open' && (
                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(item.report.id, 'hide')}
                          >
                            <EyeOff className="h-4 w-4 mr-2" />
                            Hide Content
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleAction(item.report.id, 'delete')}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Content
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAction(item.report.id, 'dismiss')}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Dismiss Report
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const targetId = item.report.target_id
                              if (item.report.target_type === 'post') {
                                router.push(`/app/community/post/${targetId}`)
                              }
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Full Content
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

