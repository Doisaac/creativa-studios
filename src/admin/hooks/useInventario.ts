import { useQuery } from '@tanstack/react-query'
import { inventarioQueryKeys } from './inventario-query-keys'
import { getInventarioService } from '../services/get-inventario.service'

interface UseInventarioParams {
  page: number
  limit: number
}

export const useInventario = ({ page, limit }: UseInventarioParams) => {
  return useQuery({
    queryKey: inventarioQueryKeys.list(page, limit),
    queryFn: () => getInventarioService({ page, limit }),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
  })
}
