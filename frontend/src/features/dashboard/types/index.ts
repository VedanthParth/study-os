export type DashboardLayout = 'dashboard' | 'planning' | 'focus'
export type PanelKey = 'tasks' | 'calendar' | 'study' | 'analytics'

export type PanelVisibility = Record<PanelKey, boolean>

export interface DashboardState {
  activeLayout: DashboardLayout
  panelVisibility: PanelVisibility
}

export const LAYOUT_LABELS: Record<DashboardLayout, string> = {
  dashboard: 'Dashboard',
  planning: 'Planning',
  focus: 'Focus',
}

export const LAYOUT_DEFAULTS: Record<DashboardLayout, PanelVisibility> = {
  dashboard: { tasks: true, calendar: true, study: true, analytics: true },
  planning: { tasks: true, calendar: true, study: false, analytics: false },
  focus: { tasks: true, calendar: false, study: true, analytics: false },
}
