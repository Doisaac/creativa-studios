export interface ClienteItem {
  id: number
  nombre_comercial: string | null
  nombre_contacto: string
  telefono: string
  email: string | null
  direccion: string
}

export interface ClientePagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ClientePageData {
  items: ClienteItem[]
  pagination: ClientePagination
}

export interface CreateClientePayload {
  nombre_comercial?: string | null
  nombre_contacto: string
  telefono: string
  email?: string | null
  direccion: string
}

export interface UpdateClientePayload {
  nombre_comercial?: string | null
  nombre_contacto?: string
  telefono?: string
  email?: string | null
  direccion?: string
}

export interface ClienteResponse {
  success: boolean
  message: string
  data: ClientePageData
}

export interface ClienteByIdResponse {
  success: boolean
  message: string
  data: ClienteItem
}

export interface ClienteMutationResponse {
  success: boolean
  message: string
  data: ClienteItem
}

export interface DeleteClienteResponse {
  success: boolean
  message: string
  data: null
}
