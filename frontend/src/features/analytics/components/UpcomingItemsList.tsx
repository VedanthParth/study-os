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
}

export function UpcomingItemsList({ items, emptyMessage }: UpcomingItemsListProps) {
  if (items.length === 0) {
    return (
      <p className="py-3 text-xs text-[var(--text-tertiary)]">
        {emptyMessage ?? 'Nothing coming up.'}
      </p>
    )
  }

  return (
    <ul className="flex flex-col divide-y divide-[var(--border-subtle)]">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between py-2">
          <span className="mr-3 min-w-0 flex-1 truncate text-sm text-[var(--text-primary)]">
            {item.title}
          </span>
          <div className="flex flex-shrink-0 items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
              {ITEM_TYPE_LABELS[item.item_type]}
            </span>
            <span className="text-xs text-[var(--text-secondary)]">
              {formatShortDate(item.date)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}
