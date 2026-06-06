import { create } from 'zustand'

import { useWorkspaceStore } from '@/features/workspace/store'

import { analyticsApi } from '../api'
import type { AnalyticsOverview } from '../types'

interface AnalyticsState {
  overview: AnalyticsOverview | null
  loading: boolean
}

interface AnalyticsActions {
  fetchOverview: (workspaceId: string) => Promise<void>
  /**
   * Silently re-fetch the overview for the active workspace so the dashboard /
   * analytics stay in sync after a task, event, or session change — no loading
   * flicker, no page refresh. A no-op when no overview is currently shown.
   */
  refresh: () => Promise<void>
  clearOverview: () => void
}

export const useAnalyticsStore = create<AnalyticsState & AnalyticsActions>((set, get) => ({
  overview: null,
  loading: false,

  fetchOverview: async (workspaceId) => {
    set({ loading: true })
    try {
      const overview = await analyticsApi.getOverview(workspaceId)
      set({ overview, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  refresh: async () => {
    if (!get().overview) return
    const workspaceId = useWorkspaceStore.getState().activeWorkspace?.id
    if (!workspaceId) return
    try {
      const overview = await analyticsApi.getOverview(workspaceId)
      set({ overview })
    } catch {
      // keep the existing overview on error
    }
  },

  clearOverview: () => set({ overview: null }),
}))
