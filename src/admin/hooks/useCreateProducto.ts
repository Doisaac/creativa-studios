import { useMutation, useQueryClient } from '@tanstack/react-query'
import { movimientosQueryKeys } from './movimientos-query-keys'
import { productosQueryKeys } from './productos-query-keys'
import { createProductoService } from '../services/create-producto.service'

export const useCreateProducto = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProductoService,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productosQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: movimientosQueryKeys.inventoryOptions(),
        }),
      ])
    },
  })
}
