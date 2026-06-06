import { ListChecks, Trash2 } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { StudyPlan } from '../types'

interface PlanCardProps {
  plan: StudyPlan
  isActive: boolean
  onSelect: (plan: StudyPlan) => void
  onDelete: (id: string) => void
}

export function PlanCard({ plan, isActive, onSelect, onDelete }: PlanCardProps) {
  const completedCount = plan.items.filter((i) => i.completed).length

  return (
    <div
      className={cn(
        'group cursor-pointer rounded-lg border p-3 transition-colors',
        isActive
          ? 'border-[var(--gray-700)] bg-[var(--surface-sunken)]'
          : 'border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--surface-sunken)]',
      )}
      onClick={() => onSelect(plan)}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 truncate text-base font-medium text-[var(--text-primary)]">
          {plan.title}
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(plan.id) }}
          className="flex-shrink-0 rounded p-0.5 text-[var(--text-tertiary)] opacity-0 transition-opacity group-hover:opacity-100 hover:text-[var(--color-exam)]"
          aria-label="Delete plan"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {plan.description && (
        <p className="mt-0.5 line-clamp-2 text-xs text-[var(--text-tertiary)]">
          {plan.description}
        </p>
      )}

      <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
        <ListChecks size={11} />
        <span>
          {completedCount}/{plan.items.length} items
        </span>
      </div>
    </div>
  )
}
