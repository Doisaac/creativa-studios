import { creativaApi } from '@/api/creativa-api'
import type { PedidoEstado, PedidoResponse } from '../types/pedidos'

interface GetPedidosParams {
  page: number
  limit: number
  estado?: PedidoEstado
  idCliente?: number
  idUsuario?: number
}

export const getPedidosService = async ({
  page,
  limit,
  estado,
  idCliente,
  idUsuario,
}: GetPedidosParams) => {
  const { data } = await creativaApi.get<PedidoResponse>('/pedido', {
    params: {
      page,
      limit,
      estado,
      idCliente,
      idUsuario,
    },
  })

  return data.data
}
