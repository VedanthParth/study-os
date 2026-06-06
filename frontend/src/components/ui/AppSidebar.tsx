import { BarChart2, BookOpen, Calendar, Feather, LayoutDashboard, Map, Plus, Settings } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

import { UserAvatar } from '@/components/ui/UserAvatar'
import { ROUTES } from '@/constants'
import { useUserStore } from '@/features/user/store'
import { WorkspaceManagementModal } from '@/features/workspace/components/WorkspaceManagementModal'
import { useWorkspaceStore } from '@/features/workspace/store'
import { WORKSPACE_TYPE_LABELS } from '@/features/workspace/types'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, to: ROUTES.HOME },
  { label: 'Calendar', icon: Calendar, to: ROUTES.CALENDAR },
  { label: 'Study', icon: BookOpen, to: ROUTES.STUDY },
  { label: 'Planner', icon: Map, to: ROUTES.PLANNER },
  { label: 'Analytics', icon: BarChart2, to: ROUTES.ANALYTICS },
] as const

const rowBase =
  'group relative flex items-center gap-3 rounded-[var(--radius-control)] px-3 text-[var(--text-md)] transition-colors'

function navRowClass(isActive: boolean) {
  return cn(
    rowBase,
    'min-h-[44px]',
    isActive
      ? 'bg-[var(--surface-sunken)] font-medium text-[var(--text-primary)]'
      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]',
  )
}

/** Left ink accent bar that marks the active row. */
function ActiveMark({ show }: { show: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-[var(--accent)] transition-opacity',
        show ? 'opacity-100' : 'opacity-0',
      )}
    />
  )
}

interface AppSidebarProps {
  className?: string
}

export function AppSidebar({ className }: AppSidebarProps) {
  const [manageOpen, setManageOpen] = useState(false)

  const currentUser = useUserStore((s) => s.currentUser)
  const workspaces = useWorkspaceStore((s) => s.workspaces)
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace)

  const userName = currentUser?.display_name ?? 'Guest User'
  const userPlan = currentUser?.is_guest === false ? (currentUser.email ?? 'StudyOS') : 'StudyOS Free'

  return (
    <>
      <aside
        className={cn(
          'flex h-full w-64 flex-shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--surface-card)]',
          className,
        )}
      >
        {/* Logo lockup — quill mark for the academic, notebook feel */}
        <div className="flex h-20 items-center gap-2.5 border-b border-[var(--border-subtle)] px-6">
          <Feather size={22} strokeWidth={1.75} className="text-[var(--color-deadline)]" />
          <span className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            StudyOS
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5">
          {/* Primary navigation */}
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
              <NavLink key={to} to={to} end={to === ROUTES.HOME} className={({ isActive }) => navRowClass(isActive)}>
                {({ isActive }) => (
                  <>
                    <ActiveMark show={isActive} />
                    <Icon size={19} strokeWidth={1.75} />
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Workspaces — switch directly from the navigator */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-3 pb-2">
              <span className="label-eyebrow">Workspaces</span>
              <button
                onClick={() => setManageOpen(true)}
                aria-label="Manage workspaces"
                title="Manage workspaces"
                className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--text-primary)]"
              >
                <Plus size={16} />
              </button>
            </div>

            {workspaces.length === 0 ? (
              <button
                onClick={() => setManageOpen(true)}
                className={cn(rowBase, 'min-h-[40px] text-[var(--text-tertiary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--text-secondary)]')}
              >
                <Plus size={18} />
                New workspace
              </button>
            ) : (
              workspaces.map((w) => {
                const isActive = activeWorkspace?.id === w.id
                return (
                  <button
                    key={w.id}
                    onClick={() => setActiveWorkspace(w)}
                    className={cn(
                      rowBase,
                      'min-h-[52px] py-2 text-left',
                      isActive
                        ? 'bg-[var(--surface-sunken)]'
                        : 'hover:bg-[var(--surface-sunken)]',
                    )}
                  >
                    <ActiveMark show={isActive} />
                    <span
                      aria-hidden="true"
                      className={cn(
                        'h-2 w-2 flex-shrink-0 rounded-full',
                        isActive ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]',
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'block truncate text-base font-medium',
                          isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]',
                        )}
                      >
                        {w.name}
                      </span>
                      <span className="block truncate text-[var(--text-meta)] text-[var(--text-tertiary)]">
                        {WORKSPACE_TYPE_LABELS[w.type]}
                      </span>
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Settings + user profile card pinned at the bottom */}
        <div className="flex flex-col gap-2 border-t border-[var(--border-subtle)] px-3 py-3">
          <NavLink to={ROUTES.SETTINGS} className={({ isActive }) => navRowClass(isActive)}>
            {({ isActive }) => (
              <>
                <ActiveMark show={isActive} />
                <Settings size={19} strokeWidth={1.75} />
                Settings
              </>
            )}
          </NavLink>

          <div className="flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2">
            <UserAvatar name={userName} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[var(--text-base)] font-medium text-[var(--text-primary)]">
                {userName}
              </p>
              <p className="truncate text-[var(--text-meta)] text-[var(--text-tertiary)]">{userPlan}</p>
            </div>
          </div>
        </div>
      </aside>

      {manageOpen && <WorkspaceManagementModal onClose={() => setManageOpen(false)} />}
    </>
  )
}
