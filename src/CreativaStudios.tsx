import type { PropsWithChildren } from 'react'
import { RouterProvider } from 'react-router'
import { Toaster } from 'sonner'
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { appRouter } from '@/app.router'
import { useAuthStore } from './auth/store/authStore'
import { CustomFullScreenLoading } from './components/custom/CustomFullScreenLoading'

const CheckAuthProvider = ({ children }: PropsWithChildren) => {
  const { checkAuthStatus } = useAuthStore()

  const { isLoading } = useQuery({
    queryKey: ['auth-provider'],
    queryFn: checkAuthStatus,
    staleTime: 1000 * 60 * 60 * 1.5,
    retry: false,
  })

  if (isLoading) {
    return <CustomFullScreenLoading />
  }

  return children
}

const queryClient = new QueryClient()
export const CreativaStudios = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors />

      {/* Provider que actualiza el estado de autenticación */}
      <CheckAuthProvider>
        <RouterProvider router={appRouter} />
      </CheckAuthProvider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
