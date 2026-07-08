import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

interface PageContainerProps {
  children: ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main
      className={cn('flex-1 overflow-y-auto px-[var(--page-margin)] py-[var(--page-margin)]', className)}
    >
      {children}
    </main>
  )
}
