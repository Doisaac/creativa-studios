export interface AuthResponse {
  success: boolean
  data: Data
}

export interface Data {
  user: User
  token: string
}

export interface User {
  id: number
  nombre: string
  rol: string
}
