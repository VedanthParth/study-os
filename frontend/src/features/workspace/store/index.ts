import { create } from 'zustand'

import { workspaceApi } from '../api'
import type { CreateWorkspacePayload, UpdateWorkspacePayload, Workspace } from '../types'

const ACTIVE_WORKSPACE_KEY = 'studyos_active_workspace_id'

interface WorkspaceState {
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  loading: boolean
}

interface WorkspaceActions {
  fetchWorkspaces: () => Promise<void>
  setActiveWorkspace: (workspace: Workspace) => void
  createWorkspace: (payload: CreateWorkspacePayload) => Promise<Workspace>
  updateWorkspace: (id: string, payload: UpdateWorkspacePayload) => Promise<Workspace>
  deleteWorkspace: (id: string) => Promise<void>
}

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>((set) => ({
  workspaces: [],
  activeWorkspace: null,
  loading: false,

  fetchWorkspaces: async () => {
    set({ loading: true })
    try {
      const workspaces = await workspaceApi.getWorkspaces()
      const storedId = localStorage.getItem(ACTIVE_WORKSPACE_KEY)
      const activeWorkspace =
        workspaces.find((w) => w.id === storedId) ?? workspaces[0] ?? null
      set({ workspaces, activeWorkspace, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  setActiveWorkspace: (workspace) => {
    localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspace.id)
    set({ activeWorkspace: workspace })
  },

  createWorkspace: async (payload) => {
    const workspace = await workspaceApi.createWorkspace(payload)
    set((state) => {
      const workspaces = [...state.workspaces, workspace]
      const activeWorkspace = state.activeWorkspace ?? workspace
      if (!state.activeWorkspace) {
        localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspace.id)
      }
      return { workspaces, activeWorkspace }
    })
    return workspace
  },

  updateWorkspace: async (id, payload) => {
    const updated = await workspaceApi.updateWorkspace(id, payload)
    set((state) => ({
      workspaces: state.workspaces.map((w) => (w.id === id ? updated : w)),
      activeWorkspace: state.activeWorkspace?.id === id ? updated : state.activeWorkspace,
    }))
    return updated
  },

  deleteWorkspace: async (id) => {
    await workspaceApi.deleteWorkspace(id)
    set((state) => {
      const workspaces = state.workspaces.filter((w) => w.id !== id)
      let activeWorkspace = state.activeWorkspace
      if (activeWorkspace?.id === id) {
        activeWorkspace = workspaces[0] ?? null
        if (activeWorkspace) {
          localStorage.setItem(ACTIVE_WORKSPACE_KEY, activeWorkspace.id)
        } else {
          localStorage.removeItem(ACTIVE_WORKSPACE_KEY)
        }
      }
      return { workspaces, activeWorkspace }
    })
  },

}))
