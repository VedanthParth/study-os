import { create } from 'zustand'

type PlannerState = Record<string, never>

export const usePlannerStore = create<PlannerState>()(() => ({}))
