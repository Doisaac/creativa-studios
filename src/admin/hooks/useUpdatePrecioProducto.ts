import { useMutation, useQueryClient } from '@tanstack/react-query'
import { preciosQueryKeys } from './precios-query-keys'
import { productosQueryKeys } from './productos-query-keys'
import { updatePrecioProductoService } from '../services/update-precio-producto.service'

export const useUpdatePrecioProducto = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePrecioProductoService,
    onSuccess: async (updatedPrecio, variables) => {
      if (updatedPrecio) {
        queryClient.setQueryData(
          preciosQueryKeys.detailByProducto(variables.idProducto),
          updatedPrecio,
        )

        queryClient.setQueriesData(
          { queryKey: preciosQueryKeys.lists() },
          (currentData: { items?: Array<{ id: number }> } | undefined) => {
            if (!currentData?.items) return currentData

            return {
              ...currentData,
              items: currentData.items.map((item) =>
                item.id === updatedPrecio.id ? updatedPrecio : item,
              ),
            }
          },
        )
      }

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
