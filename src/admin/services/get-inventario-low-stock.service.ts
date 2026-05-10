import { creativaApi } from '@/api/creativa-api'
import type { InventarioItem } from '../types/inventario'

interface InventarioLowStockResponse {
  success: boolean
  message: string
  data: InventarioItem[]
}

export const getInventarioLowStockService = async () => {
  const { data } = await creativaApi.get<InventarioLowStockResponse>(
    '/inventario/low-stock',
  )

  return data.data
}
