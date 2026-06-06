import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-[var(--radius-2xl)] border border-dashed border-[var(--border-subtle)] px-6 py-16 text-center',
        className,
      )}
    >
      {icon && <div className="mb-1 text-[var(--text-tertiary)]">{icon}</div>}
      <p className="text-lg font-semibold text-[var(--text-primary)]">{title}</p>
      {description && <p className="max-w-sm text-base text-[var(--text-tertiary)]">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
