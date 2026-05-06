import { RouterProvider } from 'react-router'
import { Toaster } from 'sonner'
import { appRouter } from '@/app.router'

export const CreativaStudios = () => {
  return (
    <>
      <Toaster richColors />
      <RouterProvider router={appRouter} />
    </>
  )
}
