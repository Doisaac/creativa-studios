import { useMutation, useQueryClient } from '@tanstack/react-query'
import { dashboardQueryKeys } from './dashboard-query-keys'
import { inventarioQueryKeys } from './inventario-query-keys'
import { movimientosQueryKeys } from './movimientos-query-keys'
import { pedidosQueryKeys } from './pedidos-query-keys'
import { updatePedidoEstadoService } from '../services/update-pedido-estado.service'

export const useUpdatePedidoEstado = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePedidoEstadoService,
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
          queryKey: inventarioQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: inventarioQueryKeys.lowStock(),
        }),
        queryClient.invalidateQueries({
          queryKey: dashboardQueryKeys.orders(),
        }),
        queryClient.invalidateQueries({
          queryKey: dashboardQueryKeys.inventory(),
        }),
        queryClient.invalidateQueries({
          queryKey: movimientosQueryKeys.all,
        }),
      ])
    },
  })
}
