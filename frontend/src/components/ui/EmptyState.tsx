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
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[var(--border-subtle)] py-16 text-center',
        className,
      )}
    >
      {icon && <div className="text-[var(--text-tertiary)]">{icon}</div>}
      <p className="text-sm font-medium text-[var(--text-secondary)]">{title}</p>
      {description && <p className="text-xs text-[var(--text-tertiary)]">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
