import { TrendingUp } from 'lucide-react'

import { LoadingState } from '@/components/ui/LoadingState'
import { DashboardPanel } from '@/features/dashboard/components/DashboardPanel'

import { useAnalyticsStore } from '../store'
import { formatShortDate, formatStudyTime } from '../types'
import { StatCard } from './StatCard'

/**
 * Analytics panel for the dashboard — shows progress stats and upcoming items.
 * Reads from the analytics store — data fetching is handled by DashboardPage.
 * Embeddable in any dashboard layout.
 */
export function AnalyticsPanel() {
  const overview = useAnalyticsStore((s) => s.overview)
  const loading = useAnalyticsStore((s) => s.loading)

  const upcomingDeadlines = overview?.upcoming_deadlines.slice(0, 4) ?? []
  const upcomingEvents = overview?.upcoming_events.slice(0, 4) ?? []
  const hasUpcoming = upcomingDeadlines.length > 0 || upcomingEvents.length > 0

  return (
    <DashboardPanel title="Overview" icon={<TrendingUp size={13} />}>
      {loading || !overview ? (
        <LoadingState label="Loading overview…" className="py-6" />
      ) : (
        <div className="flex flex-col">
          {/* Stats: 2-row × 3-col grid */}
          <div className="grid grid-cols-3 gap-2 p-4">
            <StatCard
              label="Tasks today"
              value={String(overview.tasks_completed_today)}
              dim={overview.tasks_completed_today === 0}
            />
            <StatCard
              label="Tasks this week"
              value={String(overview.tasks_completed_week)}
              dim={overview.tasks_completed_week === 0}
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
            <StatCard
              label="Study this week"
              value={formatStudyTime(overview.study_minutes_week)}
              dim={overview.study_minutes_week === 0}
            />
            <StatCard
              label="Sessions"
              value={String(overview.completed_sessions)}
              dim={overview.completed_sessions === 0}
            />
          </div>

          {/* Upcoming section */}
          {hasUpcoming && (
            <div className="border-t border-[var(--border-subtle)] px-4 py-3">
              {upcomingDeadlines.length > 0 && (
                <div className="mb-3">
                  <p className="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-[var(--text-tertiary)]">
                    Deadlines
                  </p>
                  <ul className="flex flex-col gap-1">
                    {upcomingDeadlines.map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-2">
                        <span className="min-w-0 flex-1 truncate text-xs text-[var(--text-secondary)]">
                          {item.title}
                        </span>
                        <span className="flex-shrink-0 text-[11px] text-[var(--text-tertiary)]">
                          {formatShortDate(item.date)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {upcomingEvents.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-[var(--text-tertiary)]">
                    Events
                  </p>
                  <ul className="flex flex-col gap-1">
                    {upcomingEvents.map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-2">
                        <span className="min-w-0 flex-1 truncate text-xs text-[var(--text-secondary)]">
                          {item.title}
                        </span>
                        <span className="flex-shrink-0 text-[11px] text-[var(--text-tertiary)]">
                          {formatShortDate(item.date)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </DashboardPanel>
  )
}
