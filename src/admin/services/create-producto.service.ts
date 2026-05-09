import { creativaApi } from '@/api/creativa-api'
import type {
  CreateProductoPayload,
  ProductoMutationResponse,
} from '../types/productos'

export const createProductoService = async (payload: CreateProductoPayload) => {
  const { data } = await creativaApi.post<ProductoMutationResponse>(
    '/producto',
    payload,
  )

  return data.data
}
