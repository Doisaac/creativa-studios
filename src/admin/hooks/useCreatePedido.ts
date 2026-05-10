import { useMutation, useQueryClient } from '@tanstack/react-query'
import { dashboardQueryKeys } from './dashboard-query-keys'
import { pedidosQueryKeys } from './pedidos-query-keys'
import { createPedidoService } from '../services/create-pedido.service'

export const useCreatePedido = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPedidoService,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: pedidosQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: dashboardQueryKeys.orders(),
        }),
      ])
    },
  })
}
