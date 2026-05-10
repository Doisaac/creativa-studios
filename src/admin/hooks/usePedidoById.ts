import { useQuery } from '@tanstack/react-query'
import { pedidosQueryKeys } from './pedidos-query-keys'
import { getPedidoByIdService } from '../services/get-pedido-by-id.service'

interface UsePedidoByIdParams {
  id: number | null
}

export const usePedidoById = ({ id }: UsePedidoByIdParams) => {
  return useQuery({
    queryKey: pedidosQueryKeys.detail(id ?? 0),
    queryFn: () => getPedidoByIdService(id as number),
    enabled: id !== null,
    staleTime: 1000 * 60 * 2,
  })
}
