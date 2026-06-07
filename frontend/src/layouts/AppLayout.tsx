import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

import { AppSidebar } from '@/components/ui/AppSidebar'
import { LoadingState } from '@/components/ui/LoadingState'
import { GuestOnboarding } from '@/features/user/components/GuestOnboarding'
import { useUserStore } from '@/features/user/store'

export function AppLayout() {
  const currentUser = useUserStore((s) => s.currentUser)
  const loading = useUserStore((s) => s.loading)
  const initializeUser = useUserStore((s) => s.initializeUser)

  useEffect(() => {
    void initializeUser()
  }, [initializeUser])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--surface-page)]">
        <LoadingState label="Starting StudyOS…" />
      </div>
    )
  }

  if (!currentUser) {
    return <GuestOnboarding />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--surface-page)]">
      <AppSidebar />
      {/* min-w-0 is essential: without it this flex child adopts its content's
          intrinsic min-width (the calendar grid), growing wider than the
          viewport so the parent's overflow-hidden clips the right-hand column. */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}
