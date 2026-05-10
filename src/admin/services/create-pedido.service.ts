import { creativaApi } from '@/api/creativa-api'
import type {
  CreatePedidoPayload,
  PedidoMutationResponse,
} from '../types/pedidos'

export const createPedidoService = async (payload: CreatePedidoPayload) => {
  const { data } = await creativaApi.post<PedidoMutationResponse>(
    '/pedido',
    payload,
  )

  return data.data
}
