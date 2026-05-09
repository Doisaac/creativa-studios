import type { InventarioItem, InventarioPagination } from './inventario'

export type TipoProducto = 'insumo' | 'producto' | 'servicio'

export interface ProductoItem {
  id: number
  nombre: string
  tipo: string
  costo_base: string
  codigo: string
  id_insumo_inventario: number
  nombre_insumo_inventario: string
  created_at: string
}

export interface ProductoPageData {
  items: ProductoItem[]
  pagination: InventarioPagination
}

export const buildProductoPrecioOptions = (data: ProductoPageData) =>
  data.items.map(({ id, nombre }) => ({
    id,
    nombre,
  }))

export interface CreateProductoPayload {
  nombre: string
  tipo: string
  costo_base: number
  codigo: string
  id_insumo_inventario: number
}

export interface UpdateProductoPayload {
  nombre: string
  tipo: string
  costo_base: number
  codigo: string
  id_insumo_inventario: number
}

export interface ProductoResponse {
  success: boolean
  message: string
  data: ProductoPageData
}

export interface ProductoByIdResponse {
  success: boolean
  message: string
  data: ProductoItem
}

export interface ProductoMutationResponse {
  success: boolean
  message: string
  data: ProductoItem
}

export interface DeleteProductoResponse {
  success: boolean
  message: string
  data: null
}

export interface InventarioProductoOption {
  id: InventarioItem['id']
  nombre: InventarioItem['nombre']
}
