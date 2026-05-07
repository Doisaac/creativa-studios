import { creativaApi } from '@/api/creativa-api'
import type { InventarioResponse } from '../types/inventario'

interface GetInventarioParams {
  page: number
}

export const getInventarioService = async ({ page }: GetInventarioParams) => {
  const { data } = await creativaApi.get<InventarioResponse>('/inventario', {
    params: { page },
  })

  return data.data
}
