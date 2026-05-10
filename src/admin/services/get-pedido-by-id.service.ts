import { creativaApi } from '@/api/creativa-api'
import type { PedidoByIdResponse } from '../types/pedidos'

export const getPedidoByIdService = async (id: number) => {
  const { data } = await creativaApi.get<PedidoByIdResponse>(`/pedido/${id}`)

  return data.data
}
