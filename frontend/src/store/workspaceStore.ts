import { create } from 'zustand'

type WorkspaceState = Record<string, never>

export const useWorkspaceStore = create<WorkspaceState>()(() => ({}))
