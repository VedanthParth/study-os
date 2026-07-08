import { ChevronRight } from 'lucide-react'

import { cn } from '@/utils/cn'

import type { UpcomingItem } from '../types'
import { formatShortDate } from '../types'

const ITEM_TYPE_LABELS: Record<UpcomingItem['item_type'], string> = {
  task: 'Due',
  deadline: 'Deadline',
  exam: 'Exam',
  event: 'Event',
}

interface UpcomingItemsListProps {
  items: UpcomingItem[]
  emptyMessage?: string
  /**
   * When provided, each row becomes a button that runs the returned action on
   * click (or is disabled when it returns null). Used by the dashboard panel to
   * open the underlying task / event. Omit for a plain, read-only list.
   */
  actionFor?: (item: UpcomingItem) => (() => void) | null
  /** Show the item-type label (Due / Deadline / Exam / Event). Default true. */
  showType?: boolean
}

/**
 * Single source of truth for rendering a list of upcoming deadlines / events —
 * shared by the Analytics page (read-only) and the dashboard Analytics panel
 * (clickable rows that open the item).
 */
export function UpcomingItemsList({ items, emptyMessage, actionFor, showType = true }: UpcomingItemsListProps) {
  if (items.length === 0) {
    return (
      <p className="px-2 py-3 text-[var(--text-meta)] text-[var(--text-tertiary)]">
        {emptyMessage ?? 'Nothing coming up.'}
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => {
        const onClick = actionFor?.(item) ?? null
        const meta = (
          <div className="flex flex-shrink-0 items-center gap-2.5">
            {showType && (
              <span className="text-[11px] font-medium uppercase text-[var(--text-tertiary)]">
                {ITEM_TYPE_LABELS[item.item_type]}
              </span>
            )}
            <span className="text-[var(--text-meta)] text-[var(--text-secondary)]">
              {formatShortDate(item.date)}
            </span>
            {actionFor && (
              <ChevronRight
                size={15}
                className={cn(
                  'text-[var(--text-tertiary)] transition-opacity',
                  onClick ? 'opacity-0 group-hover:opacity-100' : 'opacity-0',
                )}
              />
            )}
          </div>
        )
        const title = (
          <span className="min-w-0 flex-1 truncate text-base text-[var(--text-primary)]">
            {item.title}
          </span>
        )

        return (
          <li key={item.id}>
            {actionFor ? (
              <button
                type="button"
                onClick={onClick ?? undefined}
                disabled={!onClick}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 text-left transition-colors',
                  onClick ? 'hover:bg-[var(--surface-sunken)]' : 'cursor-default',
                )}
              >
                {title}
                {meta}
              </button>
            ) : (
              <div className="flex items-center gap-3 px-2 py-2">
                {title}
                {meta}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
