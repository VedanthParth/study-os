import { create } from 'zustand'

import type { CalendarEvent } from '@/features/calendar/types'
import type { StudyMethod } from '@/features/study/types'

/**
 * Dashboard interaction layer.
 *
 * Lets any widget trigger the shared task / event / study-session modals so the
 * dashboard works as a command center (e.g. Analytics → open a task, a calendar
 * event → open its linked task, a task → start a study session) without each
 * widget owning a duplicate modal. The modals are rendered once by
 * <DashboardInteractions/>; all business logic stays in the existing stores.
 *
 * Only the dashboard uses this — the dedicated pages keep their own local modals.
 */

interface EventIntent {
  event: CalendarEvent | null
  defaultStart: string | null
  defaultEnd: string | null
}

interface StudyIntent {
  taskId?: string | null
  /** Optional explicit method; the host falls back to the last-used method. */
  method?: StudyMethod
}

interface InteractionState {
  taskEditorId: string | null
  eventIntent: EventIntent | null
  studyIntent: StudyIntent | null
}

interface InteractionActions {
  openTaskEditor: (taskId: string) => void
  closeTaskEditor: () => void
  openEvent: (intent?: Partial<EventIntent>) => void
  closeEvent: () => void
  openStudy: (intent?: StudyIntent) => void
  closeStudy: () => void
  reset: () => void
}

const EMPTY: InteractionState = {
  taskEditorId: null,
  eventIntent: null,
  studyIntent: null,
}

export const useDashboardInteractions = create<InteractionState & InteractionActions>((set) => ({
  ...EMPTY,

  openTaskEditor: (taskId) => set({ taskEditorId: taskId }),
  closeTaskEditor: () => set({ taskEditorId: null }),

  openEvent: (intent) =>
    set({
      eventIntent: {
        event: intent?.event ?? null,
        defaultStart: intent?.defaultStart ?? null,
        defaultEnd: intent?.defaultEnd ?? null,
      },
    }),
  closeEvent: () => set({ eventIntent: null }),

  openStudy: (intent) => set({ studyIntent: { taskId: intent?.taskId ?? null, method: intent?.method } }),
  closeStudy: () => set({ studyIntent: null }),

  reset: () => set(EMPTY),
}))
