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

export interface UpdateInventarioPayload {
  nombre: string
  stock_minimo: number
  unidad_de_medida: string
}

export interface InventarioResponse {
  success: boolean
  message: string
  data: {
    items: InventarioItem[]
    pagination: InventarioPagination
  }
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
