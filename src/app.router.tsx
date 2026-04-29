import { createBrowserRouter } from 'react-router'

import { AuthLayout } from './auth/layouts/AuthLayout'
import { HomeLayout } from './home/layouts/HomeLayout'
import { HomePage } from './home/pages/HomePage'
import { LoginPage } from './auth/pages/LoginPage'
import { AdminLayout } from './admin/layouts/AdminLayout'
import { DashboardPage } from './admin/pages/DashboardPage'
import { InventarioPage } from './admin/pages/InventarioPage'
import { PedidosPage } from './admin/pages/PedidosPage'
import { ClientesPage } from './admin/pages/ClientesPage'
import { CostosPage } from './admin/pages/CostosPage'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <HomeLayout />,
    children: [{ index: true, element: <HomePage /> }],
  },
  {
    path: '/login',
    element: <AuthLayout />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: 'pedidos',
        element: <PedidosPage />,
      },
      {
        path: 'clientes',
        element: <ClientesPage />,
      },
      {
        path: 'inventario',
        element: <InventarioPage />,
      },
      {
        path: 'costos',
        element: <CostosPage />,
      },
    ],
  },
])
