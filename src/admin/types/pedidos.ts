export const PEDIDO_ESTADOS = [
  'pendiente',
  'produccion',
  'finalizado',
  'cancelado',
  'entregado',
] as const

export type PedidoEstado = (typeof PEDIDO_ESTADOS)[number]

export interface PedidoListProductoItem {
  id_producto: number
  producto_nombre: string
  cantidad: number
}

export interface PedidoListItem {
  id: number
  estado: PedidoEstado
  fecha_creacion: string
  fecha_entrega: string | null
  total_pedido: number
  id_cliente: number
  cliente_nombre: string
  cliente_nombre_comercial: string
  cliente_nombre_contacto: string
  id_usuario: number
  usuario_nombre: string
  producto_resumen: string
  total_items: number
  productos: PedidoListProductoItem[]
}

export interface PedidoDetalleItem {
  id: number
  id_pedido: number
  id_producto: number
  producto_nombre: string
  producto_codigo: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

export interface PedidoDetalle {
  id: number
  estado: PedidoEstado
  fecha_creacion: string
  fecha_entrega: string | null
  total_pedido: number
  id_cliente: number
  cliente_nombre: string
  cliente_nombre_comercial: string
  cliente_nombre_contacto: string
  cliente_telefono: string | null
  id_usuario: number
  usuario_nombre: string
  usuario_email: string
  detalles: PedidoDetalleItem[]
}

export interface PedidoPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PedidoPageData {
  items: PedidoListItem[]
  pagination: PedidoPagination
}

export interface CreatePedidoDetallePayload {
  id_producto: number
  cantidad: number
}

export interface CreatePedidoPayload {
  id_cliente: number
  fecha_entrega?: string
  detalles: CreatePedidoDetallePayload[]
}

export interface UpdatePedidoEstadoPayload {
  estado: PedidoEstado
}

export interface PedidoResponse {
  success: boolean
  message: string
  data: PedidoPageData
}

export interface PedidoByIdResponse {
  success: boolean
  message: string
  data: PedidoDetalle
}

export interface PedidoMutationResponse {
  success: boolean
  message: string
  data: PedidoDetalle
}
