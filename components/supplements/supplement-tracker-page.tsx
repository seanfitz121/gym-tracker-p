'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Pill, Crown, Zap, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePremiumStatus } from '@/lib/hooks/use-premium'
import { GetPremiumButton } from '@/components/premium/get-premium-button'
import { SupplementDashboard } from './supplement-dashboard'
import { SupplementList } from './supplement-list'
import { SupplementStats } from './supplement-stats'
import { AddSupplementDialog } from './add-supplement-dialog'
import { getDemoSupplements } from '@/lib/demo-data/supplement-demo'

interface SupplementTrackerPageProps {
  userId: string
}

function DemoSupplementView() {
  const demoSupplements = getDemoSupplements()
  const [activeTab, setActiveTab] = useState('dashboard')
  
  return (
    <div className="space-y-4 opacity-80">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="manage">Manage</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4 pointer-events-none">
          <Card className="border-dashed bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Daily Progress
                    <Badge variant="outline" className="text-xs">Demo</Badge>
                  </CardTitle>
                  <CardDescription>Sample supplements and daily intake goals</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              {demoSupplements.map((supp, idx) => (
                <Card key={supp.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{supp.icon}</div>
                      <div>
                        <h4 className="font-semibold">{supp.name}</h4>
                        <p className="text-xs text-muted-foreground">{supp.type}</p>
                      </div>
                    </div>
                    {idx < 3 && (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {idx < 3 ? supp.daily_goal : Math.floor(supp.daily_goal * 0.5)} / {supp.daily_goal} {supp.unit}
                      </span>
                      <span className="font-semibold">
                        {idx < 3 ? '100%' : '50%'}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${idx < 3 ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: idx < 3 ? '100%' : '50%' }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="mt-4 pointer-events-none">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Manage Supplements
                <Badge variant="outline" className="text-xs">Demo</Badge>
              </CardTitle>
              <CardDescription>Your supplement list</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {demoSupplements.map((supp) => (
                <div key={supp.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{supp.icon}</div>
                    <div>
                      <h4 className="font-semibold text-sm">{supp.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {supp.daily_goal} {supp.unit} daily • {supp.type}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4 pointer-events-none">
          <div className="grid gap-4">
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Weekly Stats
                  <Badge variant="outline" className="text-xs">Demo</Badge>
                </CardTitle>
                <CardDescription>Your supplement adherence this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-900">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">75%</div>
                    <div className="text-xs text-muted-foreground mt-1">Completion Rate</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">7</div>
                    <div className="text-xs text-muted-foreground mt-1">Day Streak</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border border-purple-200 dark:border-purple-900">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">28</div>
                    <div className="text-xs text-muted-foreground mt-1">Logs This Week</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg border border-amber-200 dark:border-amber-900">
                    <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">💪</div>
                    <div className="text-xs text-muted-foreground mt-1">Creatine MVP</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-dashed bg-gradient-to-br from-purple-50/30 to-pink-50/20 dark:from-purple-900/10 dark:to-pink-900/10">
              <CardHeader>
                <CardTitle>Premium Features</CardTitle>
                <CardDescription>Upgrade to unlock full functionality</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white dark:bg-gray-950 rounded-lg border">
                  <div className="text-3xl mb-2">📊</div>
                  <h4 className="font-semibold mb-1">Detailed Analytics</h4>
                  <p className="text-xs text-muted-foreground">Track adherence trends over time</p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-950 rounded-lg border">
                  <div className="text-3xl mb-2">📈</div>
                  <h4 className="font-semibold mb-1">Complete History</h4>
                  <p className="text-xs text-muted-foreground">View all past intake logs</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function SupplementTrackerPage({ userId }: SupplementTrackerPageProps) {
  const { isPremium, loading: premiumLoading } = usePremiumStatus()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSupplementAdded = () => {
    setShowAddDialog(false)
    setRefreshKey(prev => prev + 1)
  }

  // Show loading state while checking premium status
  if (premiumLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 dark:from-gray-950 dark:via-purple-950/20 dark:to-pink-950/20">
        <div className="container max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 dark:from-gray-950 dark:via-purple-950/20 dark:to-pink-950/20">
      <div className="container max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-md">
                <Pill className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">Supplement Tracker</h1>
              {isPremium && (
                <Badge variant="secondary">
                  <Zap className="h-3 w-3 mr-1 fill-purple-600 text-purple-600" />
                  Premium
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Track your daily supplement intake and build healthy habits
            </p>
          </div>
          {isPremium ? (
            <button
              onClick={() => setShowAddDialog(true)}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 px-5 py-3 shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98] touch-manipulation"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-white/20 to-pink-400/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <div className="relative flex items-center gap-2 text-white font-semibold">
                <Plus className="h-5 w-5" />
                <span>Add Supplement</span>
              </div>
            </button>
          ) : (
            <GetPremiumButton size="lg">
              Upgrade to Premium
            </GetPremiumButton>
          )}
        </div>

        {/* Tabs */}
        {isPremium ? (
          <>
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="manage">Manage</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="mt-4">
                <SupplementDashboard userId={userId} refreshKey={refreshKey} onAddClick={() => setShowAddDialog(true)} />
              </TabsContent>

              <TabsContent value="manage" className="mt-4">
                <SupplementList userId={userId} refreshKey={refreshKey} onUpdate={() => setRefreshKey(prev => prev + 1)} />
              </TabsContent>

              <TabsContent value="analytics" className="mt-4">
                <SupplementStats userId={userId} />
              </TabsContent>
            </Tabs>

            {/* Add Supplement Dialog */}
            <AddSupplementDialog
              open={showAddDialog}
              onOpenChange={setShowAddDialog}
              onSuccess={handleSupplementAdded}
            />
          </>
        ) : (
          <DemoSupplementView />
        )}
      </div>
    </div>
  )
}

