'use client'

import { useState, useEffect } from 'react'
import { SupplementCard } from './supplement-card'
import { LogSupplementDialog } from './log-supplement-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Pill } from 'lucide-react'
import { toast } from 'sonner'
import type { SupplementDefinition } from '@/lib/types/supplement'

interface SupplementDashboardProps {
  userId: string
  refreshKey: number
}

interface SupplementProgressData {
  supplement_id: string
  name: string
  type: string
  unit: string
  daily_goal: number
  is_quantitative: boolean
  color?: string
  icon?: string
  date: string
  total_taken: number
  progress_percentage: number
  log_count: number
  is_complete: boolean
}

export function SupplementDashboard({ userId, refreshKey }: SupplementDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState<SupplementProgressData[]>([])
  const [supplements, setSupplements] = useState<SupplementDefinition[]>([])
  const [selectedSupplement, setSelectedSupplement] = useState<SupplementDefinition | null>(null)
  const [showLogDialog, setShowLogDialog] = useState(false)

  useEffect(() => {
    fetchProgress()
    fetchSupplements()
  }, [refreshKey])

  const fetchProgress = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/supplements/progress')

      if (!response.ok) {
        throw new Error('Failed to fetch progress')
      }

      const data = await response.json()
      setProgress(data.progress || [])
    } catch (error) {
      console.error('Error fetching progress:', error)
      toast.error('Failed to load supplement progress')
    } finally {
      setLoading(false)
    }
  }

  const fetchSupplements = async () => {
    try {
      const response = await fetch('/api/supplements')

      if (!response.ok) {
        throw new Error('Failed to fetch supplements')
      }

      const data = await response.json()
      setSupplements(data.supplements || [])
    } catch (error) {
      console.error('Error fetching supplements:', error)
    }
  }

  const handleLogClick = (supplementId: string) => {
    const supplement = supplements.find((s) => s.id === supplementId)
    if (supplement) {
      setSelectedSupplement(supplement)
      setShowLogDialog(true)
    }
  }

  const handleLogSuccess = () => {
    fetchProgress()
  }

  if (loading && progress.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    )
  }

  if (progress.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950 mb-4">
          <Pill className="h-8 w-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Supplements Yet</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Get started by adding your first supplement to track your daily intake and build healthy habits.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Your First Supplement
          </button>
        </div>
      </div>
    )
  }

  // Separate completed and incomplete
  const incomplete = progress.filter((p) => !p.is_complete)
  const complete = progress.filter((p) => p.is_complete)

  return (
    <>
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-950 border border-blue-200 dark:border-blue-900 rounded-xl p-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {progress.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="bg-white dark:bg-gray-950 border border-green-200 dark:border-green-900 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {complete.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Complete</div>
          </div>
          <div className="bg-white dark:bg-gray-950 border border-orange-200 dark:border-orange-900 rounded-xl p-4">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {incomplete.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Remaining</div>
          </div>
          <div className="bg-white dark:bg-gray-950 border border-blue-200 dark:border-blue-900 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {progress.length > 0
                ? Math.round((complete.length / progress.length) * 100)
                : 0}
              %
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Adherence</div>
          </div>
        </div>

        {/* Incomplete Supplements */}
        {incomplete.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Pending Today</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {incomplete.map((item) => (
                <SupplementCard
                  key={item.supplement_id}
                  supplement={item}
                  onLog={() => handleLogClick(item.supplement_id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Supplements */}
        {complete.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Completed Today ✓</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {complete.map((item) => (
                <SupplementCard
                  key={item.supplement_id}
                  supplement={item}
                  onLog={() => handleLogClick(item.supplement_id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Log Dialog */}
      <LogSupplementDialog
        open={showLogDialog}
        onOpenChange={setShowLogDialog}
        supplement={selectedSupplement}
        onSuccess={handleLogSuccess}
      />
    </>
  )
}

