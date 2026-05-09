import { creativaApi } from '@/api/creativa-api'
import type { ProductoResponse } from '../types/productos'

interface GetProductosParams {
  page: number
  limit: number
}

export const getProductosService = async ({
  page,
  limit,
}: GetProductosParams) => {
  const { data } = await creativaApi.get<ProductoResponse>('/producto', {
    params: { page, limit },
  })

  return data.data
}
