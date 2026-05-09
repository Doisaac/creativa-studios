import type { InventarioItem, InventarioPagination } from './inventario'

export type TipoMovimientoInventario = 'entrada' | 'salida' | 'ajuste'

export interface MovimientoInventario {
  id: number
  tipo: TipoMovimientoInventario
  cantidad: number
  comentario: string | null
  fecha_movimiento: string
  id_inventario: number
  nombre_inventario: string
}

export interface CrearMovimientoInventarioDTO {
  tipo: TipoMovimientoInventario
  cantidad: number
  id_inventario: number
  comentario?: string
}

export interface MovimientosPageData {
  items: MovimientoInventario[]
  pagination: InventarioPagination
}

export interface MovimientosResponse {
  success: boolean
  message: string
  data: MovimientosPageData
}

export interface MovimientoByIdResponse {
  success: boolean
  message: string
  data: MovimientoInventario
}

export interface MovimientoByInventarioResponse {
  success: boolean
  message: string
  data: MovimientoInventario[]
}

export interface MovimientoMutationResponse {
  success: boolean
  message: string
  data: MovimientoInventario
}

export interface InventarioOption {
  id: InventarioItem['id']
  nombre: InventarioItem['nombre']
}
