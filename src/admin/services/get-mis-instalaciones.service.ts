import { creativaApi } from '@/api/creativa-api'
import type {
  InstalacionesFilters,
  InstalacionesResponse,
} from '../types/instalaciones'

export const getMisInstalaciones = async (
  filters: InstalacionesFilters = {},
) => {
  const { data } = await creativaApi.get<InstalacionesResponse>(
    '/instalaciones/mis-instalaciones',
    {
      params: filters,
    },
  )

  return data.data
}
