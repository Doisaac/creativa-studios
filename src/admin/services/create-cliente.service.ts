import { creativaApi } from '@/api/creativa-api'
import type {
  ClienteMutationResponse,
  CreateClientePayload,
} from '../types/clientes'

export const createClienteService = async (payload: CreateClientePayload) => {
  const { data } = await creativaApi.post<ClienteMutationResponse>(
    '/cliente',
    payload,
  )

  return data.data
}
