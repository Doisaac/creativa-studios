import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productosQueryKeys } from './productos-query-keys'
import { deleteProductoService } from '../services/delete-producto.service'

export const useDeleteProducto = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProductoService,
    onSuccess: async (_, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productosQueryKeys.all }),
        queryClient.removeQueries({ queryKey: productosQueryKeys.detail(id) }),
      ])
    },
  })
}
