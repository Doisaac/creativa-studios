import { useQuery } from '@tanstack/react-query'
import { movimientosQueryKeys } from './movimientos-query-keys'
import { getMovimientosByInventarioService } from '../services/get-movimientos-by-inventario.service'

interface UseMovimientosByInventarioParams {
  inventarioId: number | null
}

export const useMovimientosByInventario = ({
  inventarioId,
}: UseMovimientosByInventarioParams) => {
  return useQuery({
    queryKey: inventarioId
      ? movimientosQueryKeys.inventoryList(inventarioId)
      : movimientosQueryKeys.inventoryLists(),
    queryFn: () => getMovimientosByInventarioService(inventarioId!),
    enabled: inventarioId !== null,
    staleTime: 1000 * 60 * 5,
  })
}
