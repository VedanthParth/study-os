import { BarChart2, Calendar, CheckSquare, Clock, Flame, Target } from 'lucide-react'
import { useEffect } from 'react'

import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageContainer } from '@/components/ui/PageContainer'
import { SectionCard } from '@/components/ui/SectionCard'
import { TopBar } from '@/components/ui/TopBar'
import { StatCard } from '@/features/analytics/components/StatCard'
import { UpcomingItemsList } from '@/features/analytics/components/UpcomingItemsList'
import { useAnalyticsStore } from '@/features/analytics/store'
import { formatStudyTime } from '@/features/analytics/types'
import { useWorkspaceStore } from '@/features/workspace/store'

export function AnalyticsPage() {
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const fetchWorkspaces = useWorkspaceStore((s) => s.fetchWorkspaces)

  const overview = useAnalyticsStore((s) => s.overview)
  const loading = useAnalyticsStore((s) => s.loading)
  const fetchOverview = useAnalyticsStore((s) => s.fetchOverview)

  const activeWorkspaceId = activeWorkspace?.id ?? null

  useEffect(() => {
    void fetchWorkspaces()
  }, [fetchWorkspaces])

  useEffect(() => {
    if (activeWorkspaceId) {
      void fetchOverview(activeWorkspaceId)
    }
  }, [activeWorkspaceId, fetchOverview])

  return (
    <>
      <TopBar title="Analytics" />

      <PageContainer>
        {!activeWorkspaceId ? (
          <EmptyState
            icon={<BarChart2 size={32} />}
            title="No workspace selected"
            description="Select a workspace to see your analytics."
          />
        ) : loading && !overview ? (
          <LoadingState label="Loading analytics…" />
        ) : !overview ? null : (
          <div className="flex flex-col gap-6">
            {/* ── Stats ────────────────────────────────────────────────────── */}
            <SectionCard title="Progress">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatCard
                  label="Tasks completed today"
                  value={String(overview.tasks_completed_today)}
                  dim={overview.tasks_completed_today === 0}
                />
                <StatCard
                  label="Tasks completed this week"
                  value={String(overview.tasks_completed_week)}
                  dim={overview.tasks_completed_week === 0}
                />
                <StatCard
                  label="Study time today"
                  value={formatStudyTime(overview.study_minutes_today)}
                  dim={overview.study_minutes_today === 0}
                />
                <StatCard
                  label="Study time this week"
                  value={formatStudyTime(overview.study_minutes_week)}
                  dim={overview.study_minutes_week === 0}
                />
                <StatCard
                  label="Completed sessions"
                  value={String(overview.completed_sessions)}
                  dim={overview.completed_sessions === 0}
                />
                <StatCard
                  label="Active streak"
                  value={
                    overview.streak_days === 0
                      ? 'No streak'
                      : overview.streak_days === 1
                        ? '1 day'
                        : `${overview.streak_days} days`
                  }
                  dim={overview.streak_days === 0}
                />
              </div>
            </SectionCard>

            {/* ── Upcoming ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <SectionCard title="Upcoming Deadlines">
                <div className="flex items-center gap-1.5 pb-2">
                  <CheckSquare size={13} className="text-[var(--text-tertiary)]" />
                  <span className="text-xs text-[var(--text-tertiary)]">
                    Tasks &amp; calendar deadlines — next 7 days
                  </span>
                </div>
                <UpcomingItemsList
                  items={overview.upcoming_deadlines}
                  emptyMessage="No deadlines in the next 7 days."
                />
              </SectionCard>

              <SectionCard title="Upcoming Events">
                <div className="flex items-center gap-1.5 pb-2">
                  <Calendar size={13} className="text-[var(--text-tertiary)]" />
                  <span className="text-xs text-[var(--text-tertiary)]">
                    Exams &amp; events — next 7 days
                  </span>
                </div>
                <UpcomingItemsList
                  items={overview.upcoming_events}
                  emptyMessage="No exams or events in the next 7 days."
                />
              </SectionCard>
            </div>

            {/* ── Metrics legend ───────────────────────────────────────────── */}
            <div className="flex flex-wrap gap-4 text-xs text-[var(--text-tertiary)]">
              <span className="flex items-center gap-1">
                <Clock size={11} /> Study time counts completed sessions only
              </span>
              <span className="flex items-center gap-1">
                <Flame size={11} /> Streak resets if no tasks completed or sessions finished in a day
              </span>
              <span className="flex items-center gap-1">
                <Target size={11} /> All metrics are scoped to the active workspace
              </span>
            </div>
          </div>
        )}
      </PageContainer>
    </>
  )
}
