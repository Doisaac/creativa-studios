export const inventarioQueryKeys = {
  all: ['inventario'] as const,
  list: (page: number) => [...inventarioQueryKeys.all, page] as const,
  detail: (id: number) => [...inventarioQueryKeys.all, id] as const,
}
