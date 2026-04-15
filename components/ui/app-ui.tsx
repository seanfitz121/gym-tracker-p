'use client'

import * as React from 'react'
import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AppScreen({
  title,
  eyebrow,
  description,
  action,
  children,
  className,
}: {
  title?: string
  eyebrow?: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      className={cn('mx-auto w-full max-w-5xl px-3 py-4 sm:px-4 md:px-6 md:py-6', className)}
    >
      {(title || description || action) && (
        <SectionHeader eyebrow={eyebrow} title={title} description={description} action={action} />
      )}
      {children}
    </motion.section>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-5 flex items-start justify-between gap-4', className)}>
      <div className="min-w-0 space-y-1">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
        )}
        {title && <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{title}</h1>}
        {description && <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function TrainingCard({
  children,
  className,
  interactive = false,
}: {
  children: React.ReactNode
  className?: string
  interactive?: boolean
}) {
  return (
    <motion.div
      whileTap={interactive ? { scale: 0.985 } : undefined}
      className={cn(
        'rounded-lg border bg-card/95 text-card-foreground shadow-sm backdrop-blur-sm',
        'before:pointer-events-none before:absolute before:inset-0 before:rounded-lg before:content-[""]',
        interactive && 'cursor-pointer transition-colors hover:border-primary/50 hover:bg-card',
        'relative overflow-hidden',
        className
      )}
    >
      {children}
    </motion.div>
  )
}

export function MetricTile({
  icon: Icon,
  label,
  value,
  detail,
  tone = 'default',
}: {
  icon?: LucideIcon
  label: string
  value: React.ReactNode
  detail?: React.ReactNode
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
}) {
  const tones = {
    default: 'border-border bg-secondary/50 text-foreground',
    primary: 'border-primary/30 bg-primary/10 text-primary',
    success: 'border-accent/30 bg-accent/10 text-accent',
    warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
    danger: 'border-destructive/30 bg-destructive/10 text-destructive',
  }

  return (
    <div className={cn('rounded-lg border p-3', tones[tone])}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </div>
      <div className="mt-2 text-2xl font-black tabular-nums text-foreground">{value}</div>
      {detail && <div className="mt-1 text-xs text-muted-foreground">{detail}</div>}
    </div>
  )
}

export function QuickAction({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon: LucideIcon
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex min-h-16 items-center gap-3 rounded-lg border bg-card/85 p-3 shadow-sm transition-colors hover:border-primary/50', className)}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold leading-tight">{title}</p>
        {description && <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{description}</p>}
      </div>
      {children ?? <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-dashed bg-card/70 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-secondary">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h2 className="mt-4 text-lg font-black">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function TrustPanel({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border bg-secondary/50 p-4">
      <div className="mb-2 flex items-center gap-2 font-bold">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </div>
      <div className="text-sm leading-6 text-muted-foreground">{children}</div>
    </div>
  )
}

export function StickyActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-[calc(5rem+var(--safe-bottom))] z-30 rounded-lg border bg-background/90 p-2 shadow-industrial backdrop-blur-xl md:bottom-4">
      {children}
    </div>
  )
}

export function MotionList({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.04 } },
      }}
      className={className}
    >
      {React.Children.map(children, (child) => (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 8 },
            show: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
