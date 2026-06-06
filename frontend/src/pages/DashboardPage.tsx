import { LayoutDashboard } from 'lucide-react'
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

interface ColumnProps {
  columnWidgets: WidgetKey[]
  visible: WidgetKey[]
  gap: string
}

function PanelColumn({ columnWidgets, visible, gap }: ColumnProps) {
  const active = columnWidgets.filter((k) => visible.includes(k))
  if (active.length === 0) return null
  return (
    <div className="flex min-h-0 flex-col" style={{ gap }}>
      {active.map((k) => (
        <div key={k} className="min-h-0 flex-1">
          {WIDGET_ELEMENTS[k]}
        </div>
      ))}
    </div>
  )
}

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
  const colTemplate = hasLeft && hasRight ? '3fr 2fr' : '1fr'

  return (
    <div
      className="h-full"
      style={{ display: 'grid', gridTemplateColumns: colTemplate, gap }}
    >
      {hasLeft && (
        <PanelColumn columnWidgets={leftActive} visible={visible} gap={gap} />
      )}
      {hasRight && (
        <PanelColumn columnWidgets={rightActive} visible={visible} gap={gap} />
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const [manageOpen, setManageOpen] = useState(false)

  const currentUser = useUserStore((s) => s.currentUser)
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const fetchWorkspaces = useWorkspaceStore((s) => s.fetchWorkspaces)

  const fetchTasks = useTaskStore((s) => s.fetchTasks)
  const clearTasks = useTaskStore((s) => s.clearTasks)

  const fetchEvents = useCalendarStore((s) => s.fetchEvents)
  const clearEvents = useCalendarStore((s) => s.clearEvents)

  const restoreSession = useStudyStore((s) => s.restoreSession)
  const loadHistory = useStudyStore((s) => s.loadHistory)

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
        <div className="flex-1 overflow-hidden" style={{ padding: densityDef.padding }}>
          {renderLayout(view.layout_type, view.visible_widgets, densityDef.gap)}
        </div>
      )}

      {manageOpen && <WorkspaceManagementModal onClose={() => setManageOpen(false)} />}

      {/* Shared modals for cross-widget quick actions (task / event / study). */}
      <DashboardInteractions />
    </div>
  )
}
