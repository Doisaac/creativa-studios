import { creativaApi } from '@/api/creativa-api'
import type { InventarioResponse } from '../types/inventario'

interface GetInventarioParams {
  page: number
  limit: number
}

export const getInventarioService = async ({
  page,
  limit,
}: GetInventarioParams) => {
  const { data } = await creativaApi.get<InventarioResponse>('/inventario', {
    params: { page, limit },
  })

  return data.data
}
