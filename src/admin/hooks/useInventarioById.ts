import { useQuery } from '@tanstack/react-query'
import { inventarioQueryKeys } from './inventario-query-keys'
import { getInventarioByIdService } from '../services/get-inventario-by-id.service'

interface UseInventarioByIdParams {
  id: number | null
}

export const useInventarioById = ({ id }: UseInventarioByIdParams) => {
  return useQuery({
    queryKey: id ? inventarioQueryKeys.detail(id) : inventarioQueryKeys.all,
    queryFn: () => getInventarioByIdService(id!),
    enabled: id !== null,
    staleTime: 1000 * 60 * 5,
  })
}
