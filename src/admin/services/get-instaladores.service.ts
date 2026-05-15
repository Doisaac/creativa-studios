import { creativaApi } from '@/api/creativa-api'
import type { InstaladoresResponse } from '../types/instalaciones'

export const getInstaladores = async () => {
  const { data } = await creativaApi.get<InstaladoresResponse>(
    '/usuarios/instaladores',
  )

  return data.data
}
