import { Focus, LayoutDashboard, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { AnalyticsPanel } from '@/features/analytics/components/AnalyticsPanel'
import { useAnalyticsStore } from '@/features/analytics/store'
import { useCalendarStore } from '@/features/calendar/store'
import { CalendarPanel } from '@/features/dashboard/components/CalendarPanel'
import { DashboardGreeting } from '@/features/dashboard/components/DashboardGreeting'
import { DashboardInteractions } from '@/features/dashboard/components/DashboardInteractions'
import { SessionCompleteOverlay } from '@/features/dashboard/components/SessionCompleteOverlay'
import { StudyPanel } from '@/features/dashboard/components/StudyPanel'
import { TaskPanel } from '@/features/dashboard/components/TaskPanel'
import { WorkspacePanel } from '@/features/dashboard/components/WorkspacePanel'
import { WorkspaceViewControls } from '@/features/dashboard/components/WorkspaceViewControls'
import { useStudyStore } from '@/features/study/store'
import { useTaskStore } from '@/features/tasks/store'
import { useUserStore } from '@/features/user/store'
import { WorkspaceManagementModal } from '@/features/workspace/components/WorkspaceManagementModal'
import { useWorkspaceStore } from '@/features/workspace/store'
import { useWorkspaceViewStore } from '@/features/workspaceView/store'
import type { LayoutType, WidgetKey } from '@/features/workspaceView/types'
import { DENSITY_DEFINITIONS, LAYOUT_DEFINITIONS } from '@/features/workspaceView/types'

// ── Widget → Panel mapping ────────────────────────────────────────────────

const WIDGET_ELEMENTS: Record<WidgetKey, React.ReactElement> = {
  calendar:  <CalendarPanel />,
  tasks:     <TaskPanel />,
  study:     <StudyPanel />,
  analytics: <AnalyticsPanel />,
}

// ── Layout renderer ───────────────────────────────────────────────────────

function renderLayout(layout: LayoutType, visible: WidgetKey[], gap: string) {
  const def = LAYOUT_DEFINITIONS[layout]

  // Left column: layout-defined primary widgets that are currently visible
  const leftActive = def.leftWidgets.filter((k) => visible.includes(k))

  // Right column: ALL visible widgets that are NOT in the left column.
  // Using this instead of def.rightWidgets.filter() means planning/focus layouts
  // will correctly show study/analytics when the user enables them via WidgetPicker.
  const rightActive = visible.filter((k) => !def.leftWidgets.includes(k))

  const hasLeft  = leftActive.length > 0
  const hasRight = rightActive.length > 0
  // The hero column (Calendar) gets ~2/3 of the width and fills the height; the
  // supporting column (~1/3) holds the compact widgets. minmax(0,…) lets content
  // truncate instead of forcing a column wider.
  const colTemplate = hasLeft && hasRight ? 'minmax(0, 2fr) minmax(0, 1fr)' : 'minmax(0, 1fr)'

  return (
    <div style={{ display: 'grid', gridTemplateColumns: colTemplate, gap, alignItems: 'start' }}>
      {hasLeft && (
        <div className="flex flex-col" style={{ gap }}>
          {leftActive.map((k) => (
            <div key={k}>{WIDGET_ELEMENTS[k]}</div>
          ))}
        </div>
      )}
      {hasRight && (
        <div className="flex flex-col" style={{ gap }}>
          {rightActive.map((k) => (
            <div key={k}>{WIDGET_ELEMENTS[k]}</div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Focus Mode layout — the timer takes the stage, tasks stay within reach, and
 * everything else steps aside. This is a transient presentational override: it
 * never mutates the saved workspace view, so exiting restores exactly what the
 * user had configured.
 */
function renderFocus(gap: string) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap, alignItems: 'start' }}>
      <div>{WIDGET_ELEMENTS.study}</div>
      <div>{WIDGET_ELEMENTS.tasks}</div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const [manageOpen, setManageOpen] = useState(false)
  // Focus Mode is a transient view override (never persisted to the workspace).
  // Studying auto-enters it; exiting records the session id so we don't re-enter
  // for that same session — a new session starts fresh in focus again.
  const [exitedFocusSessionId, setExitedFocusSessionId] = useState<string | null>(null)

  const currentUser = useUserStore((s) => s.currentUser)
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const fetchWorkspaces = useWorkspaceStore((s) => s.fetchWorkspaces)

  const fetchTasks = useTaskStore((s) => s.fetchTasks)
  const clearTasks = useTaskStore((s) => s.clearTasks)

  const fetchEvents = useCalendarStore((s) => s.fetchEvents)
  const clearEvents = useCalendarStore((s) => s.clearEvents)

  const restoreSession = useStudyStore((s) => s.restoreSession)
  const loadHistory = useStudyStore((s) => s.loadHistory)
  const activeSession = useStudyStore((s) => s.activeSession)
  const timerStatus = useStudyStore((s) => s.timer.status)
  const hasActiveSession = activeSession !== null && (timerStatus === 'running' || timerStatus === 'paused')

  const fetchOverview = useAnalyticsStore((s) => s.fetchOverview)
  const clearOverview = useAnalyticsStore((s) => s.clearOverview)

  const fetchView   = useWorkspaceViewStore((s) => s.fetchView)
  const setLayout   = useWorkspaceViewStore((s) => s.setLayout)
  const toggleWidget = useWorkspaceViewStore((s) => s.toggleWidget)
  const setDensity  = useWorkspaceViewStore((s) => s.setDensity)
  const viewLoading = useWorkspaceViewStore((s) => s.loading)

  const activeWorkspaceId = activeWorkspace?.id ?? null

  // Derived current view — falls back to defaults before the view loads
  const viewFromStore = useWorkspaceViewStore(
    (s) => (activeWorkspaceId ? s.views[activeWorkspaceId] : undefined),
  )
  const view = viewFromStore ?? {
    workspace_id: activeWorkspaceId ?? '',
    layout_type: 'overview' as LayoutType,
    visible_widgets: ['calendar', 'tasks', 'study', 'analytics'] as WidgetKey[],
    widget_density: 'balanced' as const,
    created_at: '',
    updated_at: '',
  }
  const densityDef = DENSITY_DEFINITIONS[view.widget_density]

  useEffect(() => {
    void fetchWorkspaces()
  }, [fetchWorkspaces])

  useEffect(() => {
    if (activeWorkspaceId) {
      void fetchView(activeWorkspaceId)
      void fetchTasks(activeWorkspaceId)
      void fetchEvents(activeWorkspaceId)
      void fetchOverview(activeWorkspaceId)
      void restoreSession()
      void loadHistory(activeWorkspaceId)
    } else {
      clearTasks()
      clearEvents()
      clearOverview()
    }
  }, [activeWorkspaceId, fetchView, fetchTasks, fetchEvents, fetchOverview, restoreSession, loadHistory, clearTasks, clearEvents, clearOverview])

  // Studying auto-enters Focus Mode. Deriving it (rather than syncing state in
  // an effect) means it turns on the moment a session starts and collapses on
  // its own when the session ends — keyed to the session id so an explicit exit
  // only suppresses focus for that one session.
  const activeSessionId = activeSession?.id ?? null
  const inFocus = hasActiveSession && exitedFocusSessionId !== activeSessionId

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[var(--surface-page)]">
      {/* Top strip: workspace switcher + account */}
      <div className="flex h-16 flex-shrink-0 items-center justify-between gap-4 border-b border-[var(--border-subtle)] bg-[var(--surface-card)] px-[var(--page-margin)]">
        <WorkspacePanel onManage={() => setManageOpen(true)} />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {currentUser && <UserAvatar name={currentUser.display_name} size={36} />}
        </div>
      </div>

      {/* Greeting row: the planner's warm hero + view controls */}
      <div className="flex flex-shrink-0 flex-wrap items-end justify-between gap-4 px-[var(--page-margin)] pb-2 pt-[var(--page-margin)]">
        <DashboardGreeting />
        {activeWorkspaceId && (
          <div className="flex items-center gap-2">
            {/* Focus Mode — entered automatically while a session is live; the
                user can step out (and back in) without affecting their layout. */}
            {hasActiveSession && (
              <button
                onClick={() => setExitedFocusSessionId(inFocus ? activeSessionId : null)}
                className="btn-secondary btn-sm"
                title={inFocus ? 'Leave focus mode' : 'Return to focus mode'}
              >
                {inFocus ? <X size={15} /> : <Focus size={15} />}
                {inFocus ? 'Exit Focus' : 'Enter Focus'}
              </button>
            )}
            {!inFocus && (
              <WorkspaceViewControls
                layoutType={view.layout_type}
                visibleWidgets={view.visible_widgets}
                density={view.widget_density}
                onLayoutChange={(l) => setLayout(activeWorkspaceId, l)}
                onWidgetToggle={(w) => toggleWidget(activeWorkspaceId, w)}
                onDensityChange={(d) => setDensity(activeWorkspaceId, d)}
              />
            )}
          </div>
        )}
      </div>

      {/* Dashboard content */}
      {!activeWorkspaceId ? (
        <div className="flex-1 overflow-hidden p-[var(--page-margin)]">
          <EmptyState
            icon={<LayoutDashboard size={40} />}
            title="No workspace selected"
            description="Create or select a workspace to start."
            action={
              <button onClick={() => setManageOpen(true)} className="btn-primary">
                Manage workspaces
              </button>
            }
          />
        </div>
      ) : viewLoading && !viewFromStore ? (
        <div className="flex flex-1 items-center justify-center">
          <LoadingState label="Loading workspace…" />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-[var(--page-margin)] pb-[var(--page-margin)] pt-[var(--space-lg)]">
          {inFocus
            ? renderFocus(densityDef.gap)
            : renderLayout(view.layout_type, view.visible_widgets, densityDef.gap)}
        </div>
      )}

      {manageOpen && <WorkspaceManagementModal onClose={() => setManageOpen(false)} />}

      {/* Shared modals for cross-widget quick actions (task / event / study). */}
      <DashboardInteractions />

      {/* Soft completion experience — chime, notification, blurred celebration. */}
      <SessionCompleteOverlay />
    </div>
  )
}
