import { creativaApi } from '@/api/creativa-api'
import type {
  AsignarInstaladorPayload,
  InstalacionResponse,
} from '../types/instalaciones'

export const asignarInstalador = async (
  id: number,
  payload: AsignarInstaladorPayload,
) => {
  const { data } = await creativaApi.patch<InstalacionResponse>(
    `/instalaciones/${id}/asignar`,
    payload,
  )

  return data.data
}
