'use client'

import { Check } from 'lucide-react'
import type { SupplementProgress } from '@/lib/types/supplement'

interface SupplementCardProps {
  supplement: SupplementProgress & {
    type: string
    color?: string
    icon?: string
    is_complete: boolean
  }
  onLog: () => void
}

const TYPE_COLORS: Record<string, string> = {
  pills: '#3B82F6',
  tablets: '#A855F7',
  powder: '#F97316',
  capsule: '#10B981',
  liquid: '#06B6D4',
  other: '#6B7280',
}

export function SupplementCard({ supplement, onLog }: SupplementCardProps) {
  const progressPercent = Math.min(supplement.progress_percentage, 100)
  const isComplete = supplement.is_complete
  const typeColor = TYPE_COLORS[supplement.type] || TYPE_COLORS.other
  const displayColor = supplement.color || typeColor

  return (
    <div className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-950 border border-blue-200 dark:border-blue-900 shadow-md p-4 hover:shadow-lg transition-shadow">
      {/* Color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: displayColor }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {supplement.icon && (
              <span className="text-xl leading-none">{supplement.icon}</span>
            )}
            <h3 className="font-bold text-base truncate">{supplement.name}</h3>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
            {supplement.type}
          </p>
        </div>
        {isComplete && (
          <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-950 border-2 border-green-500">
            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {supplement.is_quantitative ? (
        <>
          <div className="mb-2">
            <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500 ease-out"
                style={{
                  width: `${progressPercent}%`,
                  background: `linear-gradient(to right, ${displayColor}, ${displayColor}dd)`,
                }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {supplement.total_taken.toFixed(1)} / {supplement.daily_goal} {supplement.unit}
            </span>
            <span className="text-xs font-medium text-gray-500">
              {Math.round(progressPercent)}%
            </span>
          </div>
        </>
      ) : (
        <div className="mb-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {supplement.log_count > 0 ? '✓ Logged today' : 'Not logged yet'}
          </p>
        </div>
      )}

      {/* Log Button */}
      {!isComplete && (
        <button
          onClick={onLog}
          className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all active:scale-[0.98] touch-manipulation"
          style={{
            backgroundColor: `${displayColor}15`,
            color: displayColor,
            border: `1px solid ${displayColor}40`,
          }}
        >
          Log Intake
        </button>
      )}

      {isComplete && (
        <div className="text-center py-2.5 text-sm font-semibold text-green-600 dark:text-green-400">
          Goal Complete! 🎉
        </div>
      )}
    </div>
  )
}

