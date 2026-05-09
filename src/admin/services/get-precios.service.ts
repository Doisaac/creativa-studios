import { creativaApi } from '@/api/creativa-api'
import { buildPrecioPageData, type PrecioResponse } from '../types/precios'

interface GetPreciosParams {
  page: number
  limit: number
}

export const getPreciosService = async ({ page, limit }: GetPreciosParams) => {
  const { data } = await creativaApi.get<PrecioResponse>('/precio', {
    params: { page, limit },
  })

  return buildPrecioPageData(data.data, page, limit)
}
