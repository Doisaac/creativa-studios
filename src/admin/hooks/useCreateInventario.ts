import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inventarioQueryKeys } from './inventario-query-keys'
import { createInventarioService } from '../services/create-inventario.service'

export const useCreateInventario = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createInventarioService,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: inventarioQueryKeys.all,
      })
    },
  })
}
