import { create } from 'axios'

export const creativaApi = create({
  baseURL: import.meta.env.VITE_API_URL,
})

creativaApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('creativa-token')

  if (token) {
    config.headers['x-token'] = token
  }

  return config
})
