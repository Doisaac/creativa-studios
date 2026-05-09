import { creativaApi } from '@/api/creativa-api'
import type { DeleteProductoResponse } from '../types/productos'

export const deleteProductoService = async (id: number) => {
  const { data } = await creativaApi.delete<DeleteProductoResponse>(
    `/producto/${id}`,
  )

  return data
}
