import { creativaApi } from '@/api/creativa-api'
import type { RenewTokenResponse } from '../types/renew-token.response'
import { normalizeUser } from '../types/auth'

export const checkAuthAction = async () => {
  const tokenInLocalStorage = localStorage.getItem('creativa-token')

  if (!tokenInLocalStorage) {
    throw new Error('No token found')
  }

  try {
    const { data } = await creativaApi.post<RenewTokenResponse>('/auth/renew')
    const { token, user } = data.data
    localStorage.setItem('creativa-token', token)

    return { token, user: normalizeUser(user) }
  } catch {
    localStorage.removeItem('creativa-token')
    throw new Error('Failed to renew token')
  }
}
