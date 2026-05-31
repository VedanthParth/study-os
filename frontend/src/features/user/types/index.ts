export interface User {
  id: string
  email: string | null
  display_name: string
  is_guest: boolean
  created_at: string
  updated_at: string
}

export interface GuestUserCreatePayload {
  display_name?: string
}

export const USER_ID_KEY = 'studyos_user_id'
