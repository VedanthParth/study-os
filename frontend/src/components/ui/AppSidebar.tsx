import { BarChart2, BookOpen, Calendar, Home, LayoutDashboard, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { ROUTES } from '@/constants'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Home', icon: Home, to: ROUTES.HOME },
  { label: 'Workspace', icon: LayoutDashboard, to: ROUTES.WORKSPACE },
  { label: 'Calendar', icon: Calendar, to: ROUTES.CALENDAR },
  { label: 'Study', icon: BookOpen, to: ROUTES.STUDY },
  { label: 'Analytics', icon: BarChart2, to: ROUTES.ANALYTICS },
] as const

interface AppSidebarProps {
  className?: string
}

export function AppSidebar({ className }: AppSidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full w-56 flex-shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--surface-card)]',
        className,
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-[var(--border-subtle)] px-5">
        <span className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
          StudyOS
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === ROUTES.HOME}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-[var(--surface-sunken)] font-medium text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]',
              )
            }
          >
            <Icon size={16} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Settings at bottom */}
      <div className="border-t border-[var(--border-subtle)] p-3">
        <NavLink
          to={ROUTES.SETTINGS}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-[var(--surface-sunken)] font-medium text-[var(--text-primary)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]',
            )
          }
        >
          <Settings size={16} strokeWidth={1.75} />
          Settings
        </NavLink>
      </div>
    </aside>
  )
}
