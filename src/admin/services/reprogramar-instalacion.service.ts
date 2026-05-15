import { creativaApi } from '@/api/creativa-api'
import type {
  InstalacionResponse,
  ReprogramarInstalacionPayload,
} from '../types/instalaciones'

export const reprogramarInstalacion = async (
  id: number,
  payload: ReprogramarInstalacionPayload,
) => {
  const { data } = await creativaApi.patch<InstalacionResponse>(
    `/instalaciones/${id}/reprogramar`,
    payload,
  )

  return data.data
}
