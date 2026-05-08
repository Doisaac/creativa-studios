import { useQuery } from '@tanstack/react-query'
import { movimientosQueryKeys } from './movimientos-query-keys'
import { getMovimientosService } from '../services/get-movimientos.service'

interface UseMovimientosParams {
  page: number
  limit: number
}

export const useMovimientos = ({ page, limit }: UseMovimientosParams) => {
  return useQuery({
    queryKey: movimientosQueryKeys.list(page, limit),
    queryFn: () => getMovimientosService({ page, limit }),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
  })
}
