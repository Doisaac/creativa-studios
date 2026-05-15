import { useMutation, useQueryClient } from '@tanstack/react-query'
import { dashboardQueryKeys } from './dashboard-query-keys'
import { inventarioQueryKeys } from './inventario-query-keys'
import { movimientosQueryKeys } from './movimientos-query-keys'
import { pedidosQueryKeys } from './pedidos-query-keys'
import { updatePedidoEstadoService } from '../services/update-pedido-estado.service'
import type { DashboardOrdersOverview } from '../types/dashboard'
import type {
  PedidoDetalle,
  PedidoEstado,
  PedidoPageData,
} from '../types/pedidos'

const buildPedidoListItemFromDetail = (pedido: PedidoDetalle) => ({
  id: pedido.id,
  estado: pedido.estado,
  fecha_creacion: pedido.fecha_creacion,
  fecha_entrega: pedido.fecha_entrega,
  total_pedido: pedido.total_pedido,
  id_cliente: pedido.id_cliente,
  cliente_nombre: pedido.cliente_nombre,
  cliente_nombre_comercial: pedido.cliente_nombre_comercial,
  cliente_nombre_contacto: pedido.cliente_nombre_contacto,
  id_usuario: pedido.id_usuario,
  usuario_nombre: pedido.usuario_nombre,
  producto_resumen: pedido.detalles
    .map((detalle) => detalle.producto_nombre)
    .join(', '),
  total_items: pedido.detalles.reduce(
    (total, detalle) => total + detalle.cantidad,
    0,
  ),
  productos: pedido.detalles.map((detalle) => ({
    id_producto: detalle.id_producto,
    producto_nombre: detalle.producto_nombre,
    cantidad: detalle.cantidad,
  })),
})

const syncPedidoListsCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  updatedPedido: PedidoDetalle,
) => {
  const updatedListItem = buildPedidoListItemFromDetail(updatedPedido)
  const pedidosListQueries = queryClient.getQueriesData<PedidoPageData>({
    queryKey: pedidosQueryKeys.lists(),
  })

  pedidosListQueries.forEach(([queryKey, currentData]) => {
    if (!currentData) return

    const [, , , , estadoFilter] = queryKey as ReturnType<
      typeof pedidosQueryKeys.list
    >
    const normalizedEstadoFilter =
      estadoFilter === 'todos' ? undefined : (estadoFilter as PedidoEstado)

    const existingIndex = currentData.items.findIndex(
      (pedido) => pedido.id === updatedPedido.id,
    )
    const matchesFilter =
      !normalizedEstadoFilter || updatedPedido.estado === normalizedEstadoFilter

    if (existingIndex === -1 && !matchesFilter) {
      return
    }

    const nextItems =
      existingIndex === -1
        ? matchesFilter
          ? [updatedListItem, ...currentData.items]
          : currentData.items
        : currentData.items.flatMap((pedido, index) => {
            if (index !== existingIndex) {
              return [pedido]
            }

            return matchesFilter ? [updatedListItem] : []
          })

    queryClient.setQueryData<PedidoPageData>(queryKey, {
      ...currentData,
      items: nextItems,
    })
  })
}

export const useUpdatePedidoEstado = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePedidoEstadoService,
    onSuccess: async (updatedPedido, variables) => {
      queryClient.setQueryData(
        pedidosQueryKeys.detail(variables.id),
        updatedPedido,
      )
      syncPedidoListsCache(queryClient, updatedPedido)
      queryClient.setQueryData<DashboardOrdersOverview>(
        dashboardQueryKeys.ordersOverview(),
        (currentData) => {
          if (!currentData) return currentData

          return {
            ...currentData,
            pedidos: currentData.pedidos.map((pedido) =>
              pedido.id === updatedPedido.id
                ? buildPedidoListItemFromDetail(updatedPedido)
                : pedido,
            ),
          }
        },
      )

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: pedidosQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: pedidosQueryKeys.detail(variables.id),
        }),
        queryClient.invalidateQueries({
          queryKey: inventarioQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: inventarioQueryKeys.lowStock(),
        }),
        queryClient.invalidateQueries({
          queryKey: dashboardQueryKeys.orders(),
        }),
        queryClient.invalidateQueries({
          queryKey: dashboardQueryKeys.inventory(),
        }),
        queryClient.invalidateQueries({
          queryKey: movimientosQueryKeys.all,
        }),
      ])
    },
  })
}
