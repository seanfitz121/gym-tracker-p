'use client'

import { Badge } from '@/components/ui/badge'
import { 
  Dumbbell, Sparkles, Star, Zap, Award, Flame, Trophy, 
  Circle, Skull, Crown, Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRank } from '@/lib/types'

interface RankBadgeProps {
  rank: UserRank
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showName?: boolean
  className?: string
}

const iconMap: Record<string, any> = {
  dumbbell: Dumbbell,
  sparkles: Sparkles,
  star: Star,
  zap: Zap,
  award: Award,
  flame: Flame,
  trophy: Trophy,
  dribbble: Circle,
  skull: Skull,
  crown: Crown,
  shield: Shield,
}

const colorMap: Record<string, string> = {
  slate: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700',
  sky: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900 dark:text-sky-200 dark:border-sky-700',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:border-indigo-700',
  violet: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900 dark:text-violet-200 dark:border-violet-700',
  purple: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700',
  amber: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700',
  cyan: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900 dark:text-cyan-200 dark:border-cyan-700',
  rose: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900 dark:text-rose-200 dark:border-rose-700',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700',
  red: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700',
}

const sizeMap = {
  sm: {
    badge: 'px-2 py-0.5 text-xs',
    icon: 'h-3 w-3',
  },
  md: {
    badge: 'px-3 py-1 text-sm',
    icon: 'h-4 w-4',
  },
  lg: {
    badge: 'px-4 py-1.5 text-base',
    icon: 'h-5 w-5',
  },
}

export function RankBadge({ 
  rank, 
  size = 'md', 
  showIcon = true, 
  showName = true,
  className 
}: RankBadgeProps) {
  const Icon = iconMap[rank.icon || 'star'] || Star
  const colorClass = colorMap[rank.color || 'slate'] || colorMap.slate
  const sizeClasses = sizeMap[size]

  return (
    <Badge 
      variant="outline"
      className={cn(
        'flex items-center gap-1.5 font-semibold border',
        colorClass,
        sizeClasses.badge,
        className
      )}
    >
      {showIcon && <Icon className={sizeClasses.icon} />}
      {showName && <span>{rank.name}</span>}
    </Badge>
  )
}


