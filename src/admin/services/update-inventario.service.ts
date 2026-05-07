import { creativaApi } from '@/api/creativa-api'
import type {
  InventarioMutationResponse,
  UpdateInventarioPayload,
} from '../types/inventario'

interface UpdateInventarioParams {
  id: number
  payload: UpdateInventarioPayload
}

export const updateInventarioService = async ({
  id,
  payload,
}: UpdateInventarioParams) => {
  const { data } = await creativaApi.patch<InventarioMutationResponse>(
    `/inventario/${id}`,
    payload,
  )

  return data.data
}
