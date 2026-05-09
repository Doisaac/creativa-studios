export interface Data {
  user: User
  token: string
}

export type UserRole = 'ADMIN' | 'RECEPCION' | 'PRODUCCION' | 'INSTALADOR' | ''

export interface User {
  id: number
  nombre: string
  rol: UserRole
}

type ApiUser = {
  id: number
  nombre?: string
  rol?: UserRole
  name?: string
  role?: UserRole
}

export const normalizeUser = (user: ApiUser): User => ({
  id: user.id,
  nombre: user.nombre ?? user.name ?? '',
  rol: user.rol ?? user.role ?? '',
})
