import { createBrowserRouter, Navigate } from 'react-router'

import { AuthLayout } from './auth/layouts/AuthLayout'
import { HomeLayout } from './home/layouts/HomeLayout'
import { HomePage } from './home/pages/HomePage'
import { LoginPage } from './auth/pages/LoginPage'
import { AdminLayout } from './admin/layouts/AdminLayout'
import { DashboardPage } from './admin/pages/DashboardPage'
import { InventarioPage } from './admin/pages/InventarioPage'
import { MovimientosPage } from './admin/pages/MovimientosPage'
import { ProductoPage } from './admin/pages/ProductoPage'
import { PedidosPage } from './admin/pages/PedidosPage'
import { ClientesPage } from './admin/pages/ClientesPage'
import { CostosPage } from './admin/pages/CostosPage'
import { AuthenticatedRoutes } from './components/routes/ProtectedRoutes'
import { RoleRouteGuard } from './components/routes/RoleRouteGuard'

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
  // Authenticated routes
  {
    path: '/admin',
    element: (
      <AuthenticatedRoutes>
        <AdminLayout />
      </AuthenticatedRoutes>
    ),
    children: [
      {
        index: true,
        element: (
          <RoleRouteGuard
            blockedRoles={['INSTALADOR']}
            redirectTo="/admin/pedidos"
          >
            <DashboardPage />
          </RoleRouteGuard>
        ),
      },
      {
        path: 'pedidos',
        element: <PedidosPage />,
      },
      {
        path: 'clientes',
        element: (
          <RoleRouteGuard
            blockedRoles={['INSTALADOR']}
            redirectTo="/admin/pedidos"
          >
            <ClientesPage />
          </RoleRouteGuard>
        ),
      },
      {
        path: 'inventario',
        element: (
          <RoleRouteGuard
            blockedRoles={['INSTALADOR']}
            redirectTo="/admin/pedidos"
          >
            <InventarioPage />
          </RoleRouteGuard>
        ),
      },
      {
        path: 'productos',
        element: (
          <RoleRouteGuard
            blockedRoles={['INSTALADOR']}
            redirectTo="/admin/pedidos"
          >
            <ProductoPage />
          </RoleRouteGuard>
        ),
      },
      {
        path: 'movimientos',
        element: (
          <RoleRouteGuard
            blockedRoles={['PRODUCCION', 'INSTALADOR']}
            redirectTo="/admin/pedidos"
          >
            <MovimientosPage />
          </RoleRouteGuard>
        ),
      },
      {
        path: 'costos',
        element: (
          <RoleRouteGuard
            blockedRoles={['PRODUCCION', 'INSTALADOR']}
            redirectTo="/admin/pedidos"
          >
            <CostosPage />
          </RoleRouteGuard>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/admin" replace />,
      },
    ],
  },
])
