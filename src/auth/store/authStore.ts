import { create } from 'zustand'
import type { User } from '../types/auth'
import { loginAction } from '../actions/login.action'
import { checkAuthAction } from '../actions/check-auth.action'

interface AuthState {
  // Properties
  status: 'checking' | 'authenticated' | 'not-authenticated'
  token: string | null
  user: User | null

  // Actions
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  checkAuthStatus: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: 'checking',
  token: null,
  user: null,

  // Actions
  login: async (email, password) => {
    try {
      const { token, user } = await loginAction(email, password)

      set({ token, user, status: 'authenticated' })
      localStorage.setItem('creativa-token', token)

      return true
    } catch {
      set({ token: null, user: null, status: 'not-authenticated' })
      localStorage.removeItem('creativa-token')
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('creativa-token')
    set({ token: null, user: null, status: 'not-authenticated' })
  },

  checkAuthStatus: async () => {
    try {
      const { user, token } = await checkAuthAction()
      set({ user, token, status: 'authenticated' })

      return true
    } catch {
      set({ user: null, token: null, status: 'not-authenticated' })
      return false
    }
  },
}))
