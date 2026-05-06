import { create } from 'axios'

export const creativaApi = create({
  baseURL: import.meta.env.VITE_API_URL,
})
