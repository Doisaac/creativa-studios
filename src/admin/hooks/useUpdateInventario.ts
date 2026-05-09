import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inventarioQueryKeys } from './inventario-query-keys'
import { updateInventarioService } from '../services/update-inventario.service'

export const useUpdateInventario = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateInventarioService,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: inventarioQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: inventarioQueryKeys.detail(variables.id),
        }),
      ])
    },
  })
}
