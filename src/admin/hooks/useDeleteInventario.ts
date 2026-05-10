import { useMutation, useQueryClient } from '@tanstack/react-query'
import { dashboardQueryKeys } from './dashboard-query-keys'
import { inventarioQueryKeys } from './inventario-query-keys'
import { deleteInventarioService } from '../services/delete-inventario.service'

export const useDeleteInventario = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteInventarioService,
    onSuccess: async (_, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: inventarioQueryKeys.all }),
        queryClient.removeQueries({ queryKey: inventarioQueryKeys.detail(id) }),
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
