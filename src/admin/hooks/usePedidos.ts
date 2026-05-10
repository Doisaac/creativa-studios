import { useQuery } from '@tanstack/react-query'
import { pedidosQueryKeys } from './pedidos-query-keys'
import { getPedidosService } from '../services/get-pedidos.service'
import type { PedidoEstado } from '../types/pedidos'

interface UsePedidosParams {
  page: number
  limit: number
  estado?: PedidoEstado
  idCliente?: number
  idUsuario?: number
}

export const usePedidos = ({
  page,
  limit,
  estado,
  idCliente,
  idUsuario,
}: UsePedidosParams) => {
  return useQuery({
    queryKey: pedidosQueryKeys.list(page, limit, estado, idCliente, idUsuario),
    queryFn: () =>
      getPedidosService({ page, limit, estado, idCliente, idUsuario }),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 2,
  })
}
