import { useQuery } from '@tanstack/react-query'
import { getInventarioService } from '../services/get-inventario.service'

interface UseInventarioParams {
  page: number
}

export const useInventario = ({ page }: UseInventarioParams) => {
  return useQuery({
    queryKey: ['inventario', page],
    queryFn: () => getInventarioService({ page }),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
  })
}
