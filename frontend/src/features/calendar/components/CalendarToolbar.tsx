import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'

export type FCView = 'timeGridWeek' | 'dayGridMonth'

interface CalendarToolbarProps {
  title: string
  currentView: FCView
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onViewChange: (view: FCView) => void
  onAddEvent: () => void
}

export function CalendarToolbar({
  title,
  currentView,
  onPrev,
  onNext,
  onToday,
  onViewChange,
  onAddEvent,
}: CalendarToolbarProps) {
  return (
    <div className="mb-4 flex items-center gap-3">
      {/* Navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          className="rounded p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]"
          aria-label="Previous"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={onNext}
          className="rounded p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]"
          aria-label="Next"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={onToday}
          className="rounded-md border border-[var(--border-subtle)] px-2.5 py-1 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--border-default)] hover:text-[var(--text-primary)]"
        >
          Today
        </button>
      </div>

      {/* Title */}
      <h2 className="flex-1 text-sm font-semibold text-[var(--text-primary)]">{title}</h2>

      {/* View switcher */}
      <div className="flex items-center rounded-md border border-[var(--border-subtle)] p-0.5">
        <button
          onClick={() => onViewChange('timeGridWeek')}
          className={cn(
            'rounded px-3 py-1 text-xs transition-colors',
            currentView === 'timeGridWeek'
              ? 'bg-[var(--gray-900)] text-[var(--text-inverse)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
          )}
        >
          Week
        </button>
        <button
          onClick={() => onViewChange('dayGridMonth')}
          className={cn(
            'rounded px-3 py-1 text-xs transition-colors',
            currentView === 'dayGridMonth'
              ? 'bg-[var(--gray-900)] text-[var(--text-inverse)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
          )}
        >
          Month
        </button>
      </div>

      {/* Add event */}
      <button
        onClick={onAddEvent}
        className="flex items-center gap-1.5 rounded-md bg-[var(--gray-900)] px-3 py-1.5 text-sm font-medium text-[var(--text-inverse)] transition-colors hover:bg-[var(--gray-700)]"
      >
        <Plus size={14} />
        Add Event
      </button>
    </div>
  )
}
