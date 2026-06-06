import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  dim?: boolean
}

export function StatCard({ label, value, dim = false }: StatCardProps) {
  return (
    <div className="flex flex-col gap-2.5 rounded-[var(--radius-lg)] bg-[var(--surface-sunken)] px-5 py-5">
      <span className="label-eyebrow">{label}</span>
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
