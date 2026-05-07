export const inventarioQueryKeys = {
  all: ['inventario'] as const,
  lists: () => [...inventarioQueryKeys.all, 'list'] as const,
  list: (page: number) => [...inventarioQueryKeys.lists(), page] as const,
  summaries: () => [...inventarioQueryKeys.all, 'summary'] as const,
  summary: () => [...inventarioQueryKeys.summaries(), 'global'] as const,
  details: () => [...inventarioQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...inventarioQueryKeys.details(), id] as const,
}
