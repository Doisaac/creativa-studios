export const inventarioQueryKeys = {
  all: ['inventario'] as const,
  lists: () => [...inventarioQueryKeys.all, 'list'] as const,
  list: (page: number, limit: number) =>
    [...inventarioQueryKeys.lists(), page, limit] as const,
  lowStockLists: () => [...inventarioQueryKeys.all, 'low-stock'] as const,
  lowStock: () => [...inventarioQueryKeys.lowStockLists(), 'global'] as const,
  summaries: () => [...inventarioQueryKeys.all, 'summary'] as const,
  summary: () => [...inventarioQueryKeys.summaries(), 'global'] as const,
  details: () => [...inventarioQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...inventarioQueryKeys.details(), id] as const,
}
