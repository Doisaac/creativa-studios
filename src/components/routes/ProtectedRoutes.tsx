import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router'

import { useAuthStore } from '@/auth/store/authStore'
import { CustomFullScreenLoading } from '../custom/CustomFullScreenLoading'

export const AuthenticatedRoutes = ({ children }: PropsWithChildren) => {
  const { status } = useAuthStore()

  if (status === 'checking') {
    return <CustomFullScreenLoading />
  }

  if (status === 'not-authenticated') {
    return <Navigate to="/login" replace />
  }

  return children
}
