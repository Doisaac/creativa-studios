import { creativaApi } from '@/api/creativa-api'
import type { InventarioByIdResponse } from '../types/inventario'

export const getInventarioByIdService = async (id: number) => {
  const { data } = await creativaApi.get<InventarioByIdResponse>(
    `/inventario/${id}`,
  )

  return data.data
}
