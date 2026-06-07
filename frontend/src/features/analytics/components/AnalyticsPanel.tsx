import { ChevronRight, TrendingUp } from 'lucide-react'

import { LoadingState } from '@/components/ui/LoadingState'
import { ROUTES } from '@/constants'
import { useCalendarStore } from '@/features/calendar/store'
import { DashboardPanel, PanelFooterLink, PanelFooterSummary } from '@/features/dashboard/components/DashboardPanel'
import { useDashboardInteractions } from '@/features/dashboard/store/interactions'
import { useTaskStore } from '@/features/tasks/store'
import { cn } from '@/lib/utils'

import { useAnalyticsStore } from '../store'
import type { UpcomingItem } from '../types'
import { formatShortDate, formatStudyTime } from '../types'
import { StatCard } from './StatCard'

/**
 * Analytics panel for the dashboard — shows progress stats and upcoming items.
 * Reads from the analytics store — data fetching is handled by DashboardPage.
 * Upcoming items are actionable: each resolves to the underlying task or event.
 */
export function AnalyticsPanel() {
  const overview = useAnalyticsStore((s) => s.overview)
  const loading = useAnalyticsStore((s) => s.loading)
  const tasks = useTaskStore((s) => s.tasks)
  const events = useCalendarStore((s) => s.events)
  const openTaskEditor = useDashboardInteractions((s) => s.openTaskEditor)
  const openEvent = useDashboardInteractions((s) => s.openEvent)

  const upcomingDeadlines = overview?.upcoming_deadlines.slice(0, 4) ?? []
  const upcomingEvents = overview?.upcoming_events.slice(0, 4) ?? []
  const hasUpcoming = upcomingDeadlines.length > 0 || upcomingEvents.length > 0

  // Resolve an analytics item to a concrete open action by matching its id
  // against the loaded tasks / events — no backend assumptions needed.
  function actionFor(item: UpcomingItem): (() => void) | null {
    if (tasks.some((t) => t.id === item.id)) return () => openTaskEditor(item.id)
    const event = events.find((e) => e.id === item.id)
    if (event) return () => openEvent({ event })
    return null
  }

  function renderItem(item: UpcomingItem) {
    const onClick = actionFor(item)
    return (
      <li key={item.id}>
        <button
          type="button"
          onClick={onClick ?? undefined}
          disabled={!onClick}
          className={cn(
            'group flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-2.5 text-left transition-colors',
            onClick ? 'hover:bg-[var(--surface-sunken)]' : 'cursor-default',
          )}
        >
          <span className="min-w-0 flex-1 truncate text-base text-[var(--text-secondary)]">
            {item.title}
          </span>
          <span className="flex-shrink-0 text-[var(--text-meta)] text-[var(--text-tertiary)]">
            {formatShortDate(item.date)}
          </span>
          {onClick && (
            <ChevronRight
              size={15}
              className="flex-shrink-0 text-[var(--text-tertiary)] opacity-0 transition-opacity group-hover:opacity-100"
            />
          )}
        </button>
      </li>
    )
  }

  return (
    <DashboardPanel
      title="Analytics"
      icon={<TrendingUp size={20} strokeWidth={1.75} />}
      padded={false}
      footer={
        <>
          <PanelFooterSummary>
            {overview ? `${overview.completed_sessions} sessions · ${overview.streak_days}d streak` : 'This week'}
          </PanelFooterSummary>
          <PanelFooterLink to={ROUTES.ANALYTICS}>View full analytics</PanelFooterLink>
        </>
      }
    >
      {loading || !overview ? (
        <LoadingState label="Loading overview…" className="py-6" />
      ) : (
        <div className="flex flex-col">
          {/* Key insights — the three metrics that matter most, given weight. */}
          <div className="p-[var(--panel-pad)]">
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                label="Tasks today"
                value={String(overview.tasks_completed_today)}
                dim={overview.tasks_completed_today === 0}
              />
              <StatCard
                label="Streak"
                value={overview.streak_days === 0 ? '—' : `${overview.streak_days}d`}
                dim={overview.streak_days === 0}
              />
              <StatCard
                label="Study today"
                value={formatStudyTime(overview.study_minutes_today)}
                dim={overview.study_minutes_today === 0}
              />
            </div>
            {/* Supporting metrics — visually quieter */}
            <p className="mt-3 text-[var(--text-meta)] text-[var(--text-tertiary)]">
              This week · {overview.tasks_completed_week} tasks ·{' '}
              {formatStudyTime(overview.study_minutes_week)} studied · {overview.completed_sessions} sessions
            </p>
          </div>

          {/* Upcoming section */}
          {hasUpcoming && (
            <div className="border-t border-[var(--border-subtle)] px-[var(--panel-pad)] py-[var(--space-lg)]">
              {upcomingDeadlines.length > 0 && (
                <div className="mb-3">
                  <p className="label-eyebrow mb-2 px-2">Deadlines</p>
                  <ul className="flex flex-col gap-0.5">{upcomingDeadlines.map(renderItem)}</ul>
                </div>
              )}
              {upcomingEvents.length > 0 && (
                <div>
                  <p className="label-eyebrow mb-2 px-2">Events</p>
                  <ul className="flex flex-col gap-0.5">{upcomingEvents.map(renderItem)}</ul>
                </div>
              )}
            </div>
          )}

          {/* Empty upcoming — keep it actionable rather than blank */}
          {!hasUpcoming && (
            <div className="flex items-center justify-between gap-3 border-t border-[var(--border-subtle)] px-[var(--panel-pad)] py-[var(--space-lg)]">
              <span className="text-base text-[var(--text-tertiary)]">Nothing scheduled soon.</span>
              <button
                onClick={() => openEvent({ event: null })}
                className="flex-shrink-0 text-[var(--text-meta)] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                Add a deadline
              </button>
            </div>
          )}
        </div>
      )}
    </DashboardPanel>
  )
}
