import { useMutation, useQueryClient } from '@tanstack/react-query'
import { preciosQueryKeys } from './precios-query-keys'
import { productosQueryKeys } from './productos-query-keys'
import { deleteProductoService } from '../services/delete-producto.service'

export const useDeleteProducto = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProductoService,
    onSuccess: async (_, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productosQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: preciosQueryKeys.productOptions(),
        }),
        queryClient.removeQueries({ queryKey: productosQueryKeys.detail(id) }),
      ])
    },
  })
}
