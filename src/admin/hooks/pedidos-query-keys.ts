import type { PedidoEstado } from '../types/pedidos'

export const pedidosQueryKeys = {
  all: ['pedidos'] as const,
  lists: () => [...pedidosQueryKeys.all, 'list'] as const,
  list: (
    page: number,
    limit: number,
    estado?: PedidoEstado,
    idCliente?: number,
    idUsuario?: number,
  ) =>
    [
      ...pedidosQueryKeys.lists(),
      page,
      limit,
      estado ?? 'todos',
      idCliente ?? 'todos',
      idUsuario ?? 'todos',
    ] as const,
  details: () => [...pedidosQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...pedidosQueryKeys.details(), id] as const,
}
