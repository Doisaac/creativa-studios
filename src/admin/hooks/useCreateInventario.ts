import { useMutation, useQueryClient } from '@tanstack/react-query'
import { dashboardQueryKeys } from './dashboard-query-keys'
import { inventarioQueryKeys } from './inventario-query-keys'
import { movimientosQueryKeys } from './movimientos-query-keys'
import { createInventarioService } from '../services/create-inventario.service'

export const useCreateInventario = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createInventarioService,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: inventarioQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: movimientosQueryKeys.inventoryOptions(),
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
