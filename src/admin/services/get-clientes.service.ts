import { creativaApi } from '@/api/creativa-api'
import type { ClienteResponse } from '../types/clientes'

interface GetClientesParams {
  page: number
  limit: number
  search?: string
}

export const getClientesService = async ({
  page,
  limit,
  search,
}: GetClientesParams) => {
  const normalizedSearch = search?.trim()

  const { data } = await creativaApi.get<ClienteResponse>('/cliente', {
    params: {
      page,
      limit,
      search: normalizedSearch || undefined,
    },
  })

  return data.data
}
