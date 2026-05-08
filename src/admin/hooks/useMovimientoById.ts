import { useQuery } from '@tanstack/react-query'
import { movimientosQueryKeys } from './movimientos-query-keys'
import { getMovimientoByIdService } from '../services/get-movimiento-by-id.service'

interface UseMovimientoByIdParams {
  id: number | null
}

export const useMovimientoById = ({ id }: UseMovimientoByIdParams) => {
  return useQuery({
    queryKey: id ? movimientosQueryKeys.detail(id) : movimientosQueryKeys.all,
    queryFn: () => getMovimientoByIdService(id!),
    enabled: id !== null,
    staleTime: 1000 * 60 * 5,
  })
}
