export interface PlanItem {
  id: string
  plan_id: string
  task_id: string | null
  calendar_event_id: string | null
  title: string
  recommendation_reason: string | null
  scheduled_date: string  // ISO date YYYY-MM-DD
  completed: boolean
  order_index: number
}

export interface StudyPlan {
  id: string
  workspace_id: string
  title: string
  description: string | null
  items: PlanItem[]
  created_at: string
  updated_at: string
}

export interface CreatePlanItemPayload {
  task_id?: string | null
  calendar_event_id?: string | null
  title: string
  recommendation_reason?: string
  scheduled_date: string  // YYYY-MM-DD
  order_index?: number
}

export interface CreatePlanPayload {
  workspace_id: string
  title: string
  description?: string
  items?: CreatePlanItemPayload[]
}

export interface UpdatePlanPayload {
  title?: string
  description?: string | null
}

export interface UpdatePlanItemPayload {
  task_id?: string | null
  calendar_event_id?: string | null
  title?: string
  recommendation_reason?: string | null
  scheduled_date?: string
  completed?: boolean
  order_index?: number
}
