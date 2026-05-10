export const clientesQueryKeys = {
  all: ['clientes'] as const,
  lists: () => [...clientesQueryKeys.all, 'list'] as const,
  list: (page: number, limit: number, search?: string) =>
    [...clientesQueryKeys.lists(), page, limit, search ?? ''] as const,
  details: () => [...clientesQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...clientesQueryKeys.details(), id] as const,
}
