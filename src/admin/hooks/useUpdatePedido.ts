import { useMutation, useQueryClient } from '@tanstack/react-query'
import { dashboardQueryKeys } from './dashboard-query-keys'
import { pedidosQueryKeys } from './pedidos-query-keys'
import { updatePedidoService } from '../services/update-pedido.service'

export const useUpdatePedido = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePedidoService,
    onSuccess: async (updatedPedido, variables) => {
      queryClient.setQueryData(
        pedidosQueryKeys.detail(variables.id),
        updatedPedido,
      )

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: pedidosQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: pedidosQueryKeys.detail(variables.id),
        }),
        queryClient.invalidateQueries({
          queryKey: dashboardQueryKeys.orders(),
        }),
      ])
    },
  })
}
