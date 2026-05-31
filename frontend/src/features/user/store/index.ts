import { create } from 'zustand'

import { userApi } from '../api'
import type { User } from '../types'
import { USER_ID_KEY } from '../types'

interface UserState {
  currentUser: User | null
  /**
   * true while loading user from storage/API on app boot.
   * Starts true to prevent onboarding flash before init completes.
   */
  loading: boolean
}

interface UserActions {
  /** Called once on app load. Reads localStorage and fetches the user if found. */
  initializeUser: () => Promise<void>
  /** Creates a new guest user, persists ID to localStorage. */
  createGuestUser: (displayName?: string) => Promise<void>
  /** Loads a user by ID (used internally and for future auth callbacks). */
  loadUser: (id: string) => Promise<void>
}

export const useUserStore = create<UserState & UserActions>((set) => ({
  currentUser: null,
  loading: true,

  initializeUser: async () => {
    const storedId = localStorage.getItem(USER_ID_KEY)
    if (!storedId) {
      set({ loading: false })
      return
    }
    try {
      const user = await userApi.getUser(storedId)
      set({ currentUser: user, loading: false })
    } catch {
      // Stored ID no longer valid (e.g., DB was reset) — clear it
      localStorage.removeItem(USER_ID_KEY)
      set({ loading: false })
    }
  },

  createGuestUser: async (displayName = 'Guest') => {
    set({ loading: true })
    try {
      const user = await userApi.createGuest({ display_name: displayName })
      localStorage.setItem(USER_ID_KEY, user.id)
      set({ currentUser: user, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  loadUser: async (id) => {
    set({ loading: true })
    try {
      const user = await userApi.getUser(id)
      set({ currentUser: user, loading: false })
    } catch {
      set({ loading: false })
    }
  },
}))
