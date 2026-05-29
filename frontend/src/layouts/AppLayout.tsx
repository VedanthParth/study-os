import { Outlet } from 'react-router-dom'

import { AppSidebar } from '@/components/ui/AppSidebar'

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--surface-page)]">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}
