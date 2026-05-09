export interface InventarioItem {
  id: number
  nombre: string
  stock_actual: number
  stock_minimo: number
  unidad_de_medida: string
  created_at: string
  bajo_stock: boolean
}

export interface InventarioPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface InventarioPageData {
  items: InventarioItem[]
  pagination: InventarioPagination
}

export interface UpdateInventarioPayload {
  nombre: string
  stock_minimo: number
  unidad_de_medida: string
}

export interface CreateInventarioPayload {
  nombre: string
  stock_minimo: number
  unidad_de_medida: string
}

export interface InventarioResponse {
  success: boolean
  message: string
  data: InventarioPageData
}

export interface InventarioByIdResponse {
  success: boolean
  message: string
  data: InventarioItem
}

export interface InventarioMutationResponse {
  success: boolean
  message: string
  data: InventarioItem
}

export interface DeleteInventarioResponse {
  success: boolean
  message: string
}

export interface InventarioSummary {
  totalProducts: number
  totalStock: number
  lowStock: number
  outOfStock: number
}
