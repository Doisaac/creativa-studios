import { creativaApi } from '@/api/creativa-api'
import type {
  CreateInstalacionPayload,
  InstalacionResponse,
} from '../types/instalaciones'

export const createInstalacion = async (
  idPedido: number,
  payload: CreateInstalacionPayload,
) => {
  const { data } = await creativaApi.post<InstalacionResponse>(
    `/pedido/${idPedido}/instalacion`,
    payload,
  )

  return data.data
}
