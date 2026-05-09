import { useMutation, useQueryClient } from '@tanstack/react-query'
import { preciosQueryKeys } from './precios-query-keys'
import { productosQueryKeys } from './productos-query-keys'
import { createPrecioService } from '../services/create-precio.service'

export const useCreatePrecio = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPrecioService,
    onSuccess: async (createdPrecio, variables) => {
      if (createdPrecio) {
        queryClient.setQueryData(
          preciosQueryKeys.detailByProducto(variables.id_producto),
          createdPrecio,
        )
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: preciosQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: productosQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: productosQueryKeys.detail(variables.id_producto),
        }),
        queryClient.invalidateQueries({
          queryKey: preciosQueryKeys.detailByProducto(variables.id_producto),
        }),
      ])
    },
  })
}
