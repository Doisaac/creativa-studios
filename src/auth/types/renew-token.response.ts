import type { Data } from './auth'

export interface RenewTokenResponse {
  success: boolean
  message: string
  data: Data
}
