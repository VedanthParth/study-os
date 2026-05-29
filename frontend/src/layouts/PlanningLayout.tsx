import { Outlet } from 'react-router-dom'

import { AppSidebar } from '@/components/ui/AppSidebar'
import { TopBar } from '@/components/ui/TopBar'

// Two-column layout: main planning area on the left, detail panel on the right.
// Used for calendar, planner, and scheduling views.
export function PlanningLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--surface-page)]">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title="Planning" />
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
          <aside className="w-72 flex-shrink-0 border-l border-[var(--border-subtle)] bg-[var(--surface-card)]" />
        </div>
      </div>
    </div>
  )
}
