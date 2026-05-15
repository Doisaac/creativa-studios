import { creativaApi } from '@/api/creativa-api'
import type {
  InstalacionResponse,
  UpdateInstalacionEstadoPayload,
} from '../types/instalaciones'

export const updateInstalacionEstado = async (
  id: number,
  payload: UpdateInstalacionEstadoPayload,
) => {
  const { data } = await creativaApi.patch<InstalacionResponse>(
    `/instalaciones/${id}/estado`,
    payload,
  )

  return data.data
}
