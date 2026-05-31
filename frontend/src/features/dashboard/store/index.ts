import { create } from 'zustand'

import type { DashboardLayout, DashboardState, PanelKey, PanelVisibility } from '../types'
import { LAYOUT_DEFAULTS } from '../types'

const STORAGE_KEY = 'studyos_dashboard'

function loadPersistedState(): DashboardState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored) as DashboardState
    // Merge with layout defaults so newly-added panel keys get their default visibility.
    return {
      activeLayout: parsed.activeLayout,
      panelVisibility: {
        ...LAYOUT_DEFAULTS[parsed.activeLayout],
        ...parsed.panelVisibility,
      },
    }
  } catch {
    return null
  }
}

function save(state: DashboardState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

const initial = loadPersistedState() ?? {
  activeLayout: 'dashboard' as DashboardLayout,
  panelVisibility: LAYOUT_DEFAULTS.dashboard,
}

interface DashboardActions {
  setLayout: (layout: DashboardLayout) => void
  togglePanel: (panel: PanelKey) => void
}

export const useDashboardStore = create<DashboardState & DashboardActions>((set) => ({
  ...initial,

  setLayout: (layout) => {
    const panelVisibility: PanelVisibility = { ...LAYOUT_DEFAULTS[layout] }
    const next: DashboardState = { activeLayout: layout, panelVisibility }
    save(next)
    set(next)
  },

  togglePanel: (panel) => {
    set((state) => {
      const panelVisibility = { ...state.panelVisibility, [panel]: !state.panelVisibility[panel] }
      const next: DashboardState = { activeLayout: state.activeLayout, panelVisibility }
      save(next)
      return next
    })
  },
}))
