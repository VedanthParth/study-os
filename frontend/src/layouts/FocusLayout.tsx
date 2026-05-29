import type { ReactNode } from 'react'

// Full-screen distraction-free layout — no sidebar, no topbar.
// Used for active study sessions, timers, and exam modes.
interface FocusLayoutProps {
  children: ReactNode
}

export function FocusLayout({ children }: FocusLayoutProps) {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[var(--surface-page)]">
      {children}
    </div>
  )
}
