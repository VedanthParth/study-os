import { create } from 'zustand'

import { analyticsApi } from '../api'
import type { AnalyticsOverview } from '../types'

interface AnalyticsState {
  overview: AnalyticsOverview | null
  loading: boolean
}

interface AnalyticsActions {
  fetchOverview: (workspaceId: string) => Promise<void>
  clearOverview: () => void
}

export const useAnalyticsStore = create<AnalyticsState & AnalyticsActions>((set) => ({
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

  clearOverview: () => set({ overview: null }),
}))
