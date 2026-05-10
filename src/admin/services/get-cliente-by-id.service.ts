import { creativaApi } from '@/api/creativa-api'
import type { ClienteByIdResponse } from '../types/clientes'

export const getClienteByIdService = async (id: number) => {
  const { data } = await creativaApi.get<ClienteByIdResponse>(`/cliente/${id}`)

  return data.data
}
