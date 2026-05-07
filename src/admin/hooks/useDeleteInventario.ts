import { useMutation, useQueryClient } from '@tanstack/react-query'
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
      ])
    },
  })
}
