export const productosQueryKeys = {
  all: ['productos'] as const,
  lists: () => [...productosQueryKeys.all, 'list'] as const,
  list: (page: number, limit: number) =>
    [...productosQueryKeys.lists(), page, limit] as const,
  details: () => [...productosQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...productosQueryKeys.details(), id] as const,
}
