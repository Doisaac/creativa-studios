import { useQuery } from '@tanstack/react-query'
import { inventarioQueryKeys } from './inventario-query-keys'
import { getInventarioSummaryService } from '../services/get-inventario-summary.service'

export const useInventarioSummary = () => {
  return useQuery({
    queryKey: inventarioQueryKeys.summary(),
    queryFn: getInventarioSummaryService,
    staleTime: 1000 * 60 * 5,
  })
}
