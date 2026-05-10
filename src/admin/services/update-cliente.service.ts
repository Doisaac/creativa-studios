import { creativaApi } from '@/api/creativa-api'
import type {
  ClienteMutationResponse,
  UpdateClientePayload,
} from '../types/clientes'

interface UpdateClienteParams {
  id: number
  payload: UpdateClientePayload
}

export const updateClienteService = async ({
  id,
  payload,
}: UpdateClienteParams) => {
  const { data } = await creativaApi.patch<ClienteMutationResponse>(
    `/cliente/${id}`,
    payload,
  )

  return data.data
}
