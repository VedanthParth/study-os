import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  dim?: boolean
}

export function StatCard({ label, value, dim = false }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[var(--radius-md)] bg-[var(--surface-sunken)] px-4 py-3.5">
      <span className="label-eyebrow truncate">{label}</span>
      <span
        className={cn(
          'text-2xl font-semibold tabular-nums leading-none tracking-tight',
          dim ? 'text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]',
        )}
      >
        {value}
      </span>
    </div>
  )
}
