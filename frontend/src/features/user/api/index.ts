import apiClient from '@/services/apiClient'

import type { GuestUserCreatePayload, User } from '../types'

export const userApi = {
  createGuest: (payload: GuestUserCreatePayload = {}): Promise<User> =>
    apiClient.post<User>('/api/users/guest', payload).then((r) => r.data),

  getUser: (id: string): Promise<User> =>
    apiClient.get<User>(`/api/users/${id}`).then((r) => r.data),
}
