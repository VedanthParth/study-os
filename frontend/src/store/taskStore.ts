import { create } from 'zustand'

type TaskState = Record<string, never>

export const useTaskStore = create<TaskState>()(() => ({}))
