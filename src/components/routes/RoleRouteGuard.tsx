import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router'

import { useAuthStore } from '@/auth/store/authStore'
import type { UserRole } from '@/auth/types/auth'

interface RoleRouteGuardProps extends PropsWithChildren {
  blockedRoles: UserRole[]
  redirectTo?: string
}

export const RoleRouteGuard = ({
  children,
  blockedRoles,
  redirectTo = '/admin',
}: RoleRouteGuardProps) => {
  const user = useAuthStore((state) => state.user)

  if (user?.rol && blockedRoles.includes(user.rol)) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}
