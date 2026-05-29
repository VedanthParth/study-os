import { cn } from '@/lib/utils'

import { WORKSPACE_TYPE_DESCRIPTIONS, WORKSPACE_TYPE_LABELS } from '../types'
import type { WorkspaceType } from '../types'

interface WorkspaceTypeCardProps {
  type: WorkspaceType
  selected: boolean
  onSelect: (type: WorkspaceType) => void
}

export function WorkspaceTypeCard({ type, selected, onSelect }: WorkspaceTypeCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(type)}
      className={cn(
        'w-full rounded-md border px-4 py-3 text-left transition-colors',
        selected
          ? 'border-[var(--gray-700)] bg-[var(--surface-sunken)]'
          : 'border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--surface-sunken)]',
      )}
    >
      <p className="text-sm font-medium text-[var(--text-primary)]">
        {WORKSPACE_TYPE_LABELS[type]}
      </p>
      <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
        {WORKSPACE_TYPE_DESCRIPTIONS[type]}
      </p>
    </button>
  )
}
