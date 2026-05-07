import { creativaApi } from '@/api/creativa-api'
import type { DeleteInventarioResponse } from '../types/inventario'

export const deleteInventarioService = async (id: number) => {
  const { data } = await creativaApi.delete<DeleteInventarioResponse>(
    `/inventario/${id}`,
  )

  return data
}
