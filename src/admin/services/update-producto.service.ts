import { creativaApi } from '@/api/creativa-api'
import type {
  ProductoMutationResponse,
  UpdateProductoPayload,
} from '../types/productos'

interface UpdateProductoParams {
  id: number
  payload: UpdateProductoPayload
}

export const updateProductoService = async ({
  id,
  payload,
}: UpdateProductoParams) => {
  const { data } = await creativaApi.patch<ProductoMutationResponse>(
    `/producto/${id}`,
    payload,
  )

  return data.data
}
