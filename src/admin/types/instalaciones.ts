export type InstalacionEstado =
  | 'pendiente'
  | 'asignada'
  | 'en_proceso'
  | 'completada'
  | 'no_realizada'
  | 'cancelada'

export interface InstalacionListItem {
  id: number
  id_pedido: number
  pedido_estado: string
  pedido_fecha_entrega: string | null

  id_cliente: number
  cliente_nombre_comercial: string | null
  cliente_nombre_contacto: string
  cliente_telefono: string

  id_instalador: number | null
  instalador_nombre: string | null

  estado: InstalacionEstado
  fecha_programada: string | null
  fecha_realizada: string | null
  direccion_instalacion: string
  observaciones: string | null
  created_at: string
}

export interface InstalacionesPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface InstalacionesListData {
  items: InstalacionListItem[]
  pagination: InstalacionesPagination
}

export interface InstalacionesResponse {
  success: boolean
  message: string
  data: InstalacionesListData
}

export interface InstalacionResponse {
  success: boolean
  message: string
  data: InstalacionListItem
}

export interface InstalacionesFilters {
  page?: number
  limit?: number
  estado?: InstalacionEstado
  idInstalador?: number
  idPedido?: number
}

export interface CreateInstalacionPayload {
  id_instalador?: number | null
  fecha_programada?: string | null
  direccion_instalacion?: string | null
  observaciones?: string | null
}

export interface UpdateInstalacionEstadoPayload {
  estado: InstalacionEstado
  observaciones?: string | null
}

export interface ReprogramarInstalacionPayload {
  fecha_programada: string
  observaciones?: string | null
}

export interface AsignarInstaladorPayload {
  id_instalador: number
}

export interface UsuarioInstalador {
  id: number
  nombre: string
}

export interface InstaladoresResponse {
  success: boolean
  message: string
  data: UsuarioInstalador[]
}
