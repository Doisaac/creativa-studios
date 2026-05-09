import { creativaApi } from '@/api/creativa-api'
import type {
  PrecioMutationResponse,
  UpdatePrecioProductoPayload,
} from '../types/precios'

interface UpdatePrecioProductoParams {
  idProducto: number
  payload: UpdatePrecioProductoPayload
}

export const updatePrecioProductoService = async ({
  idProducto,
  payload,
}: UpdatePrecioProductoParams) => {
  const { data } = await creativaApi.patch<PrecioMutationResponse>(
    `/precio/producto/${idProducto}`,
    payload,
  )

  return data.data
}
