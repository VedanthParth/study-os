import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

/**
 * Reusable panel container for the dashboard.
 * Supports collapsed state (header-only) via local toggle.
 * Visibility (whether the panel renders at all) is controlled by the dashboard store.
 */

interface DashboardPanelProps {
  title: string
  icon?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function DashboardPanel({ title, icon, actions, children, className }: DashboardPanelProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)]',
        className,
      )}
    >
      {/* PanelHeader — fine ink-line label */}
      <div className="flex h-10 flex-shrink-0 items-center justify-between border-b border-[var(--border-subtle)] px-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-[var(--text-tertiary)]">{icon}</span>}
          <h3 className="text-xs font-medium uppercase tracking-widest text-[var(--text-tertiary)]">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {actions}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="rounded p-1 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--text-secondary)]"
            aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}
          >
            {collapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
          </button>
        </div>
      </div>

      {/* PanelContainer */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto">{children}</div>
      )}
    </div>
  )
}
