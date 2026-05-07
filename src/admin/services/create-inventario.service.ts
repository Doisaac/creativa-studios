import { creativaApi } from '@/api/creativa-api'
import type {
  CreateInventarioPayload,
  InventarioMutationResponse,
} from '../types/inventario'

export const createInventarioService = async (
  payload: CreateInventarioPayload,
) => {
  const { data } = await creativaApi.post<InventarioMutationResponse>(
    '/inventario/',
    payload,
  )

  return data.data
}
