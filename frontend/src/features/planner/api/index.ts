import apiClient from '@/services/apiClient'

import type {
  CreatePlanItemPayload,
  CreatePlanPayload,
  PlanItem,
  StudyPlan,
  UpdatePlanItemPayload,
  UpdatePlanPayload,
} from '../types'

const BASE = '/api/planner'

export const plannerApi = {
  listPlans: (workspaceId: string): Promise<StudyPlan[]> =>
    apiClient.get<StudyPlan[]>(`${BASE}/plans`, { params: { workspace_id: workspaceId } }).then((r) => r.data),

  getPlan: (id: string): Promise<StudyPlan> =>
    apiClient.get<StudyPlan>(`${BASE}/plans/${id}`).then((r) => r.data),

  createPlan: (payload: CreatePlanPayload): Promise<StudyPlan> =>
    apiClient.post<StudyPlan>(`${BASE}/plans`, payload).then((r) => r.data),

  updatePlan: (id: string, payload: UpdatePlanPayload): Promise<StudyPlan> =>
    apiClient.patch<StudyPlan>(`${BASE}/plans/${id}`, payload).then((r) => r.data),

  deletePlan: (id: string): Promise<void> =>
    apiClient.delete(`${BASE}/plans/${id}`).then(() => undefined),

  addItem: (planId: string, payload: CreatePlanItemPayload): Promise<PlanItem> =>
    apiClient.post<PlanItem>(`${BASE}/plans/${planId}/items`, payload).then((r) => r.data),

  updateItem: (id: string, payload: UpdatePlanItemPayload): Promise<PlanItem> =>
    apiClient.patch<PlanItem>(`${BASE}/items/${id}`, payload).then((r) => r.data),

  deleteItem: (id: string): Promise<void> =>
    apiClient.delete(`${BASE}/items/${id}`).then(() => undefined),
}
