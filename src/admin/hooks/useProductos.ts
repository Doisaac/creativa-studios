import { useQuery } from '@tanstack/react-query'
import { productosQueryKeys } from './productos-query-keys'
import { getProductosService } from '../services/get-productos.service'

interface UseProductosParams {
  page: number
  limit: number
}

export const useProductos = ({ page, limit }: UseProductosParams) => {
  return useQuery({
    queryKey: productosQueryKeys.list(page, limit),
    queryFn: () => getProductosService({ page, limit }),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
  })
}
