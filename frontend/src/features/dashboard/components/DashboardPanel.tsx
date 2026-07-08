import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { cn } from '@/utils/cn'

/**
 * Reusable panel container for the dashboard.
 * Supports collapsed state (header-only) via local toggle.
 * Visibility (whether the panel renders at all) is controlled by the dashboard store.
 *
 * Header uses a calm title-case widget title (26–32px, tight tracking) that
 * supports the content without competing with the page greeting. An optional
 * footer gives each widget a sense of continuity ("3 events today · View Calendar").
 */

interface DashboardPanelProps {
  title: string
  icon?: ReactNode
  actions?: ReactNode
  footer?: ReactNode
  children: ReactNode
  /**
   * Apply the standard panel content padding (default true). Set false for
   * panels that manage full-bleed sections internally (e.g. Analytics dividers).
   */
  padded?: boolean
  /**
   * Marks this widget as the active focus of attention (e.g. a running study
   * session). It rises higher and gains a soft accent ring — communicating
   * importance without shouting.
   */
  active?: boolean
  /**
   * Fill the available height of the parent column (used by the calendar hero
   * so the dashboard fits the viewport). The content area then scrolls
   * internally instead of growing the page.
   */
  fill?: boolean
  className?: string
}

/**
 * The single source of truth for dashboard panel spacing. Header, content, and
 * footer padding all derive from --panel-pad here, so widgets stay cohesive and
 * never need their own spacing overrides.
 */
export function DashboardPanel({
  title,
  icon,
  actions,
  footer,
  children,
  padded = true,
  active = false,
  fill = false,
  className,
}: DashboardPanelProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      style={{ transition: 'transform 250ms var(--ease-soft), box-shadow 250ms var(--ease-soft)' }}
      className={cn(
        'flex flex-col overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border-subtle)] bg-[var(--surface-card)]',
        fill && 'h-full min-h-0',
        // Depth system: widgets float gently and lift on hover. The active
        // widget rests higher with an accent ring. Motion is disabled for users
        // who prefer reduced motion.
        active
          ? 'shadow-[var(--shadow-xl)] ring-1 ring-[var(--color-study)] -translate-y-1 motion-reduce:translate-y-0'
          : 'shadow-[var(--shadow-md)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] motion-reduce:transform-none motion-reduce:hover:translate-y-0',
        className,
      )}
    >
      {/* PanelHeader — title framed by whitespace, not pinned to the edge */}
      <div className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-[var(--border-subtle)] px-[var(--panel-pad)] py-[var(--space-xl)]">
        <div className="flex min-w-0 items-center gap-3">
          {icon && <span className="flex-shrink-0 text-[var(--text-tertiary)]">{icon}</span>}
          <h2 className="truncate text-[length:var(--text-widget-title)] font-semibold tracking-tight text-[var(--text-primary)]">
            {title}
          </h2>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          {actions}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-control)] text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--text-secondary)]"
            aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}
          >
            {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </div>

      {/* PanelContainer — fills + scrolls internally in fill mode, otherwise
          sizes to its content. */}
      {!collapsed && (
        <div className={cn(fill && 'min-h-0 flex-1 overflow-y-auto', padded && 'p-[var(--panel-pad)]')}>
          {children}
        </div>
      )}

      {/* PanelFooter — summary + continuity link */}
      {!collapsed && footer && (
        <div className="flex flex-shrink-0 items-center justify-between gap-3 border-t border-[var(--border-subtle)] px-[var(--panel-pad)] py-[var(--space-lg)] text-[var(--text-meta)]">
          {footer}
        </div>
      )}
    </div>
  )
}

/**
 * Shared footer building blocks so every widget footer reads consistently:
 * a muted summary on the left and an optional "View …" link on the right.
 */
export function PanelFooterSummary({ children }: { children: ReactNode }) {
  return <span className="truncate text-[var(--text-tertiary)]">{children}</span>
}

export function PanelFooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="flex-shrink-0 font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
    >
      {children}
    </Link>
  )
}
