import { cn } from '@/lib/utils'

import { useDashboardStore } from '../store'
import type { DashboardLayout } from '../types'
import { LAYOUT_LABELS } from '../types'

const LAYOUTS: DashboardLayout[] = ['dashboard', 'planning', 'focus']

export function LayoutSwitcher() {
  const activeLayout = useDashboardStore((s) => s.activeLayout)
  const setLayout = useDashboardStore((s) => s.setLayout)

  return (
    <div className="flex items-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-0.5">
      {LAYOUTS.map((layout) => (
        <button
          key={layout}
          onClick={() => setLayout(layout)}
          className={cn(
            'rounded-md px-3 py-1 text-xs transition-colors',
            activeLayout === layout
              ? 'bg-[var(--surface-card)] font-medium text-[var(--text-primary)] shadow-[var(--shadow-sm)]'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]',
          )}
        >
          {LAYOUT_LABELS[layout]}
        </button>
      ))}
    </div>
  )
}
