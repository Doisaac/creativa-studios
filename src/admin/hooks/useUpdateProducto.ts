import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productosQueryKeys } from './productos-query-keys'
import { updateProductoService } from '../services/update-producto.service'

export const useUpdateProducto = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProductoService,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productosQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: productosQueryKeys.detail(variables.id),
        }),
      ])
    },
  })
}
