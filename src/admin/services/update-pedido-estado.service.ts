import { creativaApi } from '@/api/creativa-api'
import type {
  PedidoMutationResponse,
  PedidoEstado,
  UpdatePedidoEstadoPayload,
} from '../types/pedidos'

interface UpdatePedidoEstadoParams {
  id: number
  estado: PedidoEstado
}

export const updatePedidoEstadoService = async ({
  id,
  estado,
}: UpdatePedidoEstadoParams) => {
  const payload: UpdatePedidoEstadoPayload = { estado }

  const { data } = await creativaApi.patch<PedidoMutationResponse>(
    `/pedido/${id}/estado`,
    payload,
  )

  return data.data
}
