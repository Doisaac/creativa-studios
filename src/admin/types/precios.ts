import type { ProductoItem, ProductoPageData } from './productos'

export interface PrecioItem {
  id: number
  margen_ganancia: number
  precio_sugerido: number
  id_producto: number
  nombre_producto: string
}

export interface PrecioPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PrecioPageData {
  items: PrecioItem[]
  pagination: PrecioPagination
}

export interface CreatePrecioPayload {
  id_producto: number
  margen_ganancia: number
}

export interface UpdatePrecioProductoPayload {
  margen_ganancia: number
}

export interface PrecioResponse {
  success: boolean
  message: string
  data: PrecioPageData | PrecioItem[] | null
}

export interface PrecioMutationResponse {
  success: boolean
  message: string
  data: PrecioItem | null
}

export interface ProductoPrecioOption {
  id: ProductoItem['id']
  nombre: ProductoItem['nombre']
}

export interface PrecioSummary {
  totalPrecios: number
  averageMargin: number
  averageSuggestedPrice: number
}

export const buildPrecioPageData = (
  data: PrecioResponse['data'],
  page: number,
  limit: number,
): PrecioPageData => {
  if (data && 'items' in data) {
    return data
  }

  const items = Array.isArray(data) ? data : []

  return {
    items,
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: 1,
    },
  }
}

export const buildProductoPrecioOptions = (
  data: ProductoPageData,
): ProductoPrecioOption[] =>
  data.items.map(({ id, nombre }) => ({
    id,
    nombre,
  }))
