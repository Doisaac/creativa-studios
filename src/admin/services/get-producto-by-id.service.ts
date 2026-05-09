import { creativaApi } from '@/api/creativa-api'
import type { ProductoByIdResponse } from '../types/productos'

export const getProductoByIdService = async (id: number) => {
  const { data } = await creativaApi.get<ProductoByIdResponse>(
    `/producto/${id}`,
  )

  return data.data
}
