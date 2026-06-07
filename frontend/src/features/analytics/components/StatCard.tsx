import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  dim?: boolean
}

export function StatCard({ label, value, dim = false }: StatCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] px-4 py-4">
      <span className="label-eyebrow truncate">{label}</span>
      <span
        className={cn(
          'font-semibold tabular-nums leading-none tracking-tight',
          'text-[1.75rem]',
          dim ? 'text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]',
        )}
      >
        {value}
      </span>
    </div>
  )
}
