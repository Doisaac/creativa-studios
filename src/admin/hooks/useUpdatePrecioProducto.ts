import { useMutation, useQueryClient } from '@tanstack/react-query'
import { preciosQueryKeys } from './precios-query-keys'
import { productosQueryKeys } from './productos-query-keys'
import { updatePrecioProductoService } from '../services/update-precio-producto.service'

export const useUpdatePrecioProducto = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePrecioProductoService,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: preciosQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: preciosQueryKeys.detailByProducto(variables.idProducto),
        }),
        queryClient.invalidateQueries({ queryKey: productosQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: productosQueryKeys.detail(variables.idProducto),
        }),
      ])
    },
  })
}
