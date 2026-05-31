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
        'rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6',
        className,
      )}
    >
      {title && (
        <h3 className="mb-5 text-xs font-medium uppercase tracking-widest text-[var(--text-tertiary)]">
          {title}
        </h3>
      )}
      {children}
    </section>
  )
}
