import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  dim?: boolean
}

export function StatCard({ label, value, dim = false }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-[var(--surface-sunken)] px-3 py-3">
      <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-tertiary)]">
        {label}
      </span>
      <span
        className={cn(
          'text-base font-semibold tabular-nums leading-tight',
          dim ? 'text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]',
        )}
      >
        {value}
      </span>
    </div>
  )
}
