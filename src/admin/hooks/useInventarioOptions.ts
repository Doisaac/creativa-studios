import { useQuery } from '@tanstack/react-query'
import { movimientosQueryKeys } from './movimientos-query-keys'
import { getInventarioOptionsService } from '../services/get-inventario-options.service'

export const useInventarioOptions = () => {
  return useQuery({
    queryKey: movimientosQueryKeys.inventoryOptions(),
    queryFn: getInventarioOptionsService,
    staleTime: 1000 * 60 * 5,
  })
}
