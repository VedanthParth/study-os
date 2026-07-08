import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

interface SectionCardProps {
  children: ReactNode
  className?: string
  title?: string
}

export function SectionCard({ children, className, title }: SectionCardProps) {
  return (
    <section
      className={cn(
        'rounded-[var(--radius-panel)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-[var(--panel-pad)] shadow-[var(--shadow-sm)]',
        className,
      )}
    >
      {title && (
        <h3 className="mb-5 text-[length:var(--text-section)] font-semibold tracking-tight text-[var(--text-primary)]">
          {title}
        </h3>
      )}
      {children}
    </section>
  )
}
