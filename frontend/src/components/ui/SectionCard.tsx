import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface SectionCardProps {
  children: ReactNode
  className?: string
  title?: string
}

export function SectionCard({ children, className, title }: SectionCardProps) {
  return (
    <section
      className={cn(
        'rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-sm)]',
        className,
      )}
    >
      {title && (
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          {title}
        </h3>
      )}
      {children}
    </section>
  )
}
