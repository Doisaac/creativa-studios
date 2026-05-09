import { creativaApi } from '@/api/creativa-api'
import type { MovimientoByInventarioResponse } from '../types/movimientos'

export const getMovimientosByInventarioService = async (
  inventarioId: number,
) => {
  const { data } = await creativaApi.get<MovimientoByInventarioResponse>(
    `/movimientos/inventario/${inventarioId}`,
  )

  return data.data
}
