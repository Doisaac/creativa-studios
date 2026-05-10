import { useQuery } from '@tanstack/react-query'
import { inventarioQueryKeys } from './inventario-query-keys'
import { getInventarioLowStockService } from '../services/get-inventario-low-stock.service'

export const useInventarioLowStock = () => {
  return useQuery({
    queryKey: inventarioQueryKeys.lowStock(),
    queryFn: getInventarioLowStockService,
    staleTime: 1000 * 60 * 5,
  })
}
