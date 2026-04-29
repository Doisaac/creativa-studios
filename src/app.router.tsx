import { createBrowserRouter } from 'react-router'
import { HomeLayout } from './home/layouts/HomeLayout'
import { HomePage } from './home/pages/HomePage'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <HomeLayout />,
    children: [{ index: true, element: <HomePage /> }],
  },
])
