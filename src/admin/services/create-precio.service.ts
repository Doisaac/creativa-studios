import { creativaApi } from '@/api/creativa-api'
import type {
  CreatePrecioPayload,
  PrecioMutationResponse,
} from '../types/precios'

export const createPrecioService = async (payload: CreatePrecioPayload) => {
  const { data } = await creativaApi.post<PrecioMutationResponse>(
    '/precio',
    payload,
  )

  return data.data
}
