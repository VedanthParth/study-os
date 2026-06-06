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
    <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3">
      {/* Navigation group */}
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]"
          aria-label="Previous"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={onNext}
          className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]"
          aria-label="Next"
        >
          <ChevronRight size={18} />
        </button>
        <button onClick={onToday} className="btn-secondary btn-sm ml-1.5">
          Today
        </button>
      </div>

      {/* Title — given room to breathe between the groups */}
      <h2 className="flex-1 px-1 text-[length:var(--text-section)] font-semibold tracking-tight text-[var(--text-primary)]">
        {title}
      </h2>

      {/* View options + actions cluster */}
      <div className="flex items-center gap-3">
      <div className="flex items-center rounded-[var(--radius-control)] border border-[var(--border-default)] p-1">
        <button
          onClick={() => onViewChange('timeGridWeek')}
          className={cn(
            'rounded-md px-3.5 py-1.5 text-base transition-colors',
            currentView === 'timeGridWeek'
              ? 'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
          )}
        >
          Week
        </button>
        <button
          onClick={() => onViewChange('dayGridMonth')}
          className={cn(
            'rounded-md px-3.5 py-1.5 text-base transition-colors',
            currentView === 'dayGridMonth'
              ? 'bg-[var(--button-primary-bg)] text-[var(--button-primary-text)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
          )}
        >
          Month
        </button>
        </div>

        {/* Add event */}
        <button onClick={onAddEvent} className="btn-primary btn-sm">
          <Plus size={17} />
          Add Event
        </button>
      </div>
    </div>
  )
}
