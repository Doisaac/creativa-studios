import { creativaApi } from '@/api/creativa-api'
import type { MovimientosResponse } from '../types/movimientos'

interface GetMovimientosParams {
  page: number
  limit: number
}

export const getMovimientosService = async ({
  page,
  limit,
}: GetMovimientosParams) => {
  const { data } = await creativaApi.get<MovimientosResponse>('/movimientos/', {
    params: { page, limit },
  })

  return data.data
}
