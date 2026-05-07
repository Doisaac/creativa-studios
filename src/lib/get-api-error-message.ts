import { AxiosError } from 'axios'

interface ApiErrorResponse {
  message?: string
  error?: string
  errors?: string[]
}

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors[0]
    }

    if (data?.message) {
      return data.message
    }

    if (data?.error) {
      return data.error
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
