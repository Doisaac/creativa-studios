import { creativaApi } from '@/api/creativa-api'
import type {
  PedidoMutationResponse,
  UpdatePedidoPayload,
} from '../types/pedidos'

interface UpdatePedidoParams {
  id: number
  payload: UpdatePedidoPayload
}

export const updatePedidoService = async ({
  id,
  payload,
}: UpdatePedidoParams) => {
  const { data } = await creativaApi.put<PedidoMutationResponse>(
    `/pedido/${id}`,
    payload,
  )

  return data.data
}
