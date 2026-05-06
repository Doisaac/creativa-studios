import { create } from 'zustand'
import type { User } from '../types/login.response'
import { loginAction } from '../actions/loginAction'

interface AuthState {
  // Properties
  status: 'checking' | 'authenticated' | 'not-authenticated'
  token: string | null
  user: User | null

  // Actions
  login: (email: string, password: string) => Promise<boolean>
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: 'checking',
  token: null,
  user: null,

  // Actions
  login: async (email, password) => {
    try {
      const { token, user } = await loginAction(email, password)

      console.log({
        info: 'login request',
        token,
        user,
      })

      set({ token, user, status: 'authenticated' })
      return true
    } catch {
      set({ token: null, user: null, status: 'not-authenticated' })
      return false
    }
  },
}))
