import { Outlet } from 'react-router-dom'

import { AppSidebar } from '@/components/ui/AppSidebar'
import { TopBar } from '@/components/ui/TopBar'

interface DashboardLayoutProps {
  title: string
}

export function DashboardLayout({ title }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--surface-page)]">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title={title} />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
