import { cn } from '@/lib/utils'

interface LoadingStateProps {
  label?: string
  className?: string
}

export function LoadingState({ label = 'Loading…', className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16', className)}>
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--border-default)] border-t-[var(--accent)]" />
      <p className="text-base text-[var(--text-tertiary)]">{label}</p>
    </div>
  )
}
