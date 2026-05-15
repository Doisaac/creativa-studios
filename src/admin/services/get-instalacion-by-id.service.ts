import { creativaApi } from '@/api/creativa-api'
import type { InstalacionResponse } from '../types/instalaciones'

export const getInstalacionById = async (id: number) => {
  const { data } = await creativaApi.get<InstalacionResponse>(
    `/instalaciones/${id}`,
  )

  return data.data
}
