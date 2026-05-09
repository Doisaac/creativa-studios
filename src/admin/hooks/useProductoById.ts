import { useQuery } from '@tanstack/react-query'
import { productosQueryKeys } from './productos-query-keys'
import { getProductoByIdService } from '../services/get-producto-by-id.service'

interface UseProductoByIdParams {
  id: number | null
}

export const useProductoById = ({ id }: UseProductoByIdParams) => {
  return useQuery({
    queryKey: id ? productosQueryKeys.detail(id) : productosQueryKeys.all,
    queryFn: () => getProductoByIdService(id!),
    enabled: id !== null,
    staleTime: 1000 * 60 * 5,
  })
}
