import { create } from 'zustand'

import { plannerApi } from '../api'
import type {
  CreatePlanItemPayload,
  CreatePlanPayload,
  PlanItem,
  StudyPlan,
  UpdatePlanItemPayload,
  UpdatePlanPayload,
} from '../types'

interface PlannerState {
  plans: StudyPlan[]
  activePlan: StudyPlan | null
  loading: boolean
}

interface PlannerActions {
  fetchPlans: (workspaceId: string) => Promise<void>
  fetchPlan: (id: string) => Promise<void>
  createPlan: (payload: CreatePlanPayload) => Promise<StudyPlan>
  updatePlan: (id: string, payload: UpdatePlanPayload) => Promise<StudyPlan>
  deletePlan: (id: string) => Promise<void>
  addItem: (planId: string, payload: CreatePlanItemPayload) => Promise<PlanItem>
  updateItem: (id: string, payload: UpdatePlanItemPayload) => Promise<PlanItem>
  deleteItem: (id: string) => Promise<void>
  setActivePlan: (plan: StudyPlan | null) => void
  clearPlanner: () => void
}

function replacePlanInList(plans: StudyPlan[], updated: StudyPlan): StudyPlan[] {
  return plans.map((p) => (p.id === updated.id ? updated : p))
}

function updateItemInPlan(plan: StudyPlan, updatedItem: PlanItem): StudyPlan {
  return { ...plan, items: plan.items.map((i) => (i.id === updatedItem.id ? updatedItem : i)) }
}

export const usePlannerStore = create<PlannerState & PlannerActions>((set, get) => ({
  plans: [],
  activePlan: null,
  loading: false,

  fetchPlans: async (workspaceId) => {
    set({ loading: true })
    try {
      const plans = await plannerApi.listPlans(workspaceId)
      set({ plans, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  fetchPlan: async (id) => {
    const plan = await plannerApi.getPlan(id)
    set((state) => ({
      activePlan: plan,
      plans: replacePlanInList(state.plans, plan),
    }))
  },

  createPlan: async (payload) => {
    const plan = await plannerApi.createPlan(payload)
    set((state) => ({ plans: [plan, ...state.plans], activePlan: plan }))
    return plan
  },

  updatePlan: async (id, payload) => {
    const updated = await plannerApi.updatePlan(id, payload)
    set((state) => ({
      plans: replacePlanInList(state.plans, updated),
      activePlan: state.activePlan?.id === id ? updated : state.activePlan,
    }))
    return updated
  },

  deletePlan: async (id) => {
    await plannerApi.deletePlan(id)
    set((state) => ({
      plans: state.plans.filter((p) => p.id !== id),
      activePlan: state.activePlan?.id === id ? null : state.activePlan,
    }))
  },

  addItem: async (planId, payload) => {
    const item = await plannerApi.addItem(planId, payload)
    set((state) => {
      const updatedPlans = state.plans.map((p) =>
        p.id === planId ? { ...p, items: [...p.items, item] } : p,
      )
      const updatedActive =
        state.activePlan?.id === planId
          ? { ...state.activePlan, items: [...state.activePlan.items, item] }
          : state.activePlan
      return { plans: updatedPlans, activePlan: updatedActive }
    })
    return item
  },

  updateItem: async (id, payload) => {
    const updated = await plannerApi.updateItem(id, payload)
    set((state) => {
      const plan = state.plans.find((p) => p.items.some((i) => i.id === id))
      if (!plan) return state
      const updatedPlan = updateItemInPlan(plan, updated)
      return {
        plans: replacePlanInList(state.plans, updatedPlan),
        activePlan:
          state.activePlan?.id === plan.id ? updateItemInPlan(state.activePlan, updated) : state.activePlan,
      }
    })
    return updated
  },

  deleteItem: async (id) => {
    const plan = get().plans.find((p) => p.items.some((i) => i.id === id))
    await plannerApi.deleteItem(id)
    if (!plan) return
    const updatedPlan = { ...plan, items: plan.items.filter((i) => i.id !== id) }
    set((state) => ({
      plans: replacePlanInList(state.plans, updatedPlan),
      activePlan:
        state.activePlan?.id === plan.id ? updatedPlan : state.activePlan,
    }))
  },

  setActivePlan: (plan) => set({ activePlan: plan }),

  clearPlanner: () => set({ plans: [], activePlan: null }),
}))
