export const movimientosQueryKeys = {
  all: ['movimientos'] as const,
  lists: () => [...movimientosQueryKeys.all, 'list'] as const,
  list: (page: number, limit: number) =>
    [...movimientosQueryKeys.lists(), page, limit] as const,
  details: () => [...movimientosQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...movimientosQueryKeys.details(), id] as const,
  inventoryLists: () => [...movimientosQueryKeys.all, 'inventory'] as const,
  inventoryList: (inventarioId: number) =>
    [...movimientosQueryKeys.inventoryLists(), inventarioId] as const,
  inventoryOptions: () =>
    [...movimientosQueryKeys.all, 'inventory-options'] as const,
}
