import { create } from 'zustand'

import { workspaceViewApi } from '../api'
import type {
  LayoutType,
  UpdateWorkspaceViewPayload,
  WidgetDensity,
  WidgetKey,
  WorkspaceView,
} from '../types'
import { LAYOUT_DEFINITIONS, VIEW_STORAGE_KEY } from '../types'

interface WorkspaceViewState {
  /** Keyed by workspace_id. */
  views: Record<string, WorkspaceView>
  loading: boolean
}

interface WorkspaceViewActions {
  fetchView: (workspaceId: string) => Promise<void>
  updateView: (workspaceId: string, payload: UpdateWorkspaceViewPayload) => Promise<void>
  /** Optimistic: set layout and reset visible_widgets to layout defaults. */
  setLayout: (workspaceId: string, layout: LayoutType) => void
  /** Optimistic: toggle a widget on/off. */
  toggleWidget: (workspaceId: string, widget: WidgetKey) => void
  /** Optimistic: change density. */
  setDensity: (workspaceId: string, density: WidgetDensity) => void
}

function loadCached(workspaceId: string): WorkspaceView | null {
  try {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY(workspaceId))
    return stored ? (JSON.parse(stored) as WorkspaceView) : null
  } catch {
    return null
  }
}

function saveCache(view: WorkspaceView) {
  localStorage.setItem(VIEW_STORAGE_KEY(view.workspace_id), JSON.stringify(view))
}

function applyOptimistic(
  state: WorkspaceViewState,
  workspaceId: string,
  updater: (v: WorkspaceView) => WorkspaceView,
): WorkspaceViewState {
  const existing = state.views[workspaceId]
  if (!existing) return state
  const updated = updater(existing)
  saveCache(updated)
  return { ...state, views: { ...state.views, [workspaceId]: updated } }
}

export const useWorkspaceViewStore = create<WorkspaceViewState & WorkspaceViewActions>(
  (set, get) => ({
    views: {},
    loading: false,

    fetchView: async (workspaceId) => {
      // Show cached immediately so the UI doesn't flash
      const cached = loadCached(workspaceId)
      if (cached) {
        set((s) => ({ views: { ...s.views, [workspaceId]: cached } }))
      } else {
        set({ loading: true })
      }
      try {
        const view = await workspaceViewApi.getView(workspaceId)
        saveCache(view)
        set((s) => ({ views: { ...s.views, [workspaceId]: view }, loading: false }))
      } catch {
        set({ loading: false })
      }
    },

    updateView: async (workspaceId, payload) => {
      try {
        const view = await workspaceViewApi.upsertView(workspaceId, payload)
        saveCache(view)
        set((s) => ({ views: { ...s.views, [workspaceId]: view } }))
      } catch {
        // silent — optimistic state already applied
      }
    },

    setLayout: (workspaceId, layout) => {
      const newWidgets = LAYOUT_DEFINITIONS[layout].defaultWidgets
      set((s) =>
        applyOptimistic(s, workspaceId, (v) => ({
          ...v,
          layout_type: layout,
          visible_widgets: newWidgets,
        })),
      )
      void get().updateView(workspaceId, {
        layout_type: layout,
        visible_widgets: newWidgets,
      })
    },

    toggleWidget: (workspaceId, widget) => {
      set((s) => {
        const view = s.views[workspaceId]
        if (!view) return s
        const has = view.visible_widgets.includes(widget)
        // Always keep at least one widget visible
        if (has && view.visible_widgets.length === 1) return s
        const visible_widgets = has
          ? view.visible_widgets.filter((w) => w !== widget)
          : ([...view.visible_widgets, widget] as WidgetKey[])
        return applyOptimistic(s, workspaceId, (v) => ({ ...v, visible_widgets }))
      })
      const view = get().views[workspaceId]
      if (view) {
        void get().updateView(workspaceId, { visible_widgets: view.visible_widgets })
      }
    },

    setDensity: (workspaceId, density) => {
      set((s) => applyOptimistic(s, workspaceId, (v) => ({ ...v, widget_density: density })))
      void get().updateView(workspaceId, { widget_density: density })
    },
  }),
)
