import { creativaApi } from '@/api/creativa-api'
import type { DeleteClienteResponse } from '../types/clientes'

export const deleteClienteService = async (id: number) => {
  const { data } = await creativaApi.delete<DeleteClienteResponse>(
    `/cliente/${id}`,
  )

  return data
}
