import { cn } from '@/lib/utils'

interface TopBarProps {
  title: string
  actions?: React.ReactNode
  className?: string
}

export function TopBar({ title, actions, className }: TopBarProps) {
  return (
    <header
      className={cn(
        'flex h-14 flex-shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface-card)] px-6',
        className,
      )}
    >
      <h1 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h1>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
