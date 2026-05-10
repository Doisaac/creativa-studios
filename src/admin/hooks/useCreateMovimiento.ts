import { useMutation, useQueryClient } from '@tanstack/react-query'
import { dashboardQueryKeys } from './dashboard-query-keys'
import { inventarioQueryKeys } from './inventario-query-keys'
import { movimientosQueryKeys } from './movimientos-query-keys'
import { createMovimientoService } from '../services/create-movimiento.service'

export const useCreateMovimiento = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMovimientoService,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: movimientosQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: movimientosQueryKeys.inventoryList(variables.id_inventario),
        }),
        queryClient.invalidateQueries({
          queryKey: inventarioQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: inventarioQueryKeys.lowStock(),
        }),
        queryClient.invalidateQueries({
          queryKey: dashboardQueryKeys.inventory(),
        }),
      ])
    },
  })
}
