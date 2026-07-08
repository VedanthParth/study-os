import { TrendingUp } from 'lucide-react'

import { LoadingState } from '@/components/ui/LoadingState'
import { ROUTES } from '@/constants'
import { useCalendarStore } from '@/features/calendar/store'
import { DashboardPanel, PanelFooterLink, PanelFooterSummary } from '@/features/dashboard/components/DashboardPanel'
import { useDashboardInteractions } from '@/features/dashboard/store/interactions'
import { useTaskStore } from '@/features/tasks/store'

import { useAnalyticsStore } from '../store'
import type { UpcomingItem } from '../types'
import { formatStudyTime } from '../types'
import { StatCard } from './StatCard'
import { UpcomingItemsList } from './UpcomingItemsList'

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
                  <UpcomingItemsList items={upcomingDeadlines} actionFor={actionFor} showType={false} />
                </div>
              )}
              {upcomingEvents.length > 0 && (
                <div>
                  <p className="label-eyebrow mb-2 px-2">Events</p>
                  <UpcomingItemsList items={upcomingEvents} actionFor={actionFor} showType={false} />
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
