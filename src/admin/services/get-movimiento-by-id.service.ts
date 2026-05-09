import { creativaApi } from '@/api/creativa-api'
import type { MovimientoByIdResponse } from '../types/movimientos'

export const getMovimientoByIdService = async (id: number) => {
  const { data } = await creativaApi.get<MovimientoByIdResponse>(
    `/movimientos/${id}`,
  )

  return data.data
}
