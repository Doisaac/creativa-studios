import { useQuery } from '@tanstack/react-query'
import { inventarioQueryKeys } from './inventario-query-keys'
import { getInventarioService } from '../services/get-inventario.service'

interface UseInventarioParams {
  page: number
}

export const useInventario = ({ page }: UseInventarioParams) => {
  return useQuery({
    queryKey: inventarioQueryKeys.list(page),
    queryFn: () => getInventarioService({ page }),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
  })
}
