import { ThemeToggle } from '@/components/ui/ThemeToggle'
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
        'flex h-20 flex-shrink-0 items-center justify-between gap-4 border-b border-[var(--border-subtle)] bg-[var(--surface-card)] px-[var(--page-margin)]',
        className,
      )}
    >
      <h1 className="truncate text-[length:var(--text-page-title)] font-semibold tracking-tight text-[var(--text-primary)]">
        {title}
      </h1>
      <div className="flex flex-shrink-0 items-center gap-2">
        {actions}
        <ThemeToggle />
      </div>
    </header>
  )
}
