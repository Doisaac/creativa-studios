import type { InventarioItem } from './inventario'
import type { PedidoListItem } from './pedidos'

export interface DashboardOrdersOverview {
  pedidos: PedidoListItem[]
  total: number
}

export interface DashboardInventoryOverview {
  items: InventarioItem[]
  total: number
}
