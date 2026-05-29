import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main className={cn('flex-1 overflow-y-auto px-6 py-8', className)}>{children}</main>
  )
}
