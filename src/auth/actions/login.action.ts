import { creativaApi } from '@/api/creativa-api'
import type { AuthResponse } from '../types/login.response'
import { normalizeUser } from '../types/auth'

export const loginAction = async (email: string, password: string) => {
  const response = await creativaApi.post<AuthResponse>('/auth/login', {
    email,
    contrasena: password,
  })

  const {
    data: { token, user },
  } = response.data

  return { token, user: normalizeUser(user) }
}
