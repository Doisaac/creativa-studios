import { creativaApi } from '@/api/creativa-api'
import type {
  CrearMovimientoInventarioDTO,
  MovimientoMutationResponse,
} from '../types/movimientos'

export const createMovimientoService = async (
  payload: CrearMovimientoInventarioDTO,
) => {
  const { data } = await creativaApi.post<MovimientoMutationResponse>(
    '/movimientos/',
    payload,
  )

  return data.data
}
