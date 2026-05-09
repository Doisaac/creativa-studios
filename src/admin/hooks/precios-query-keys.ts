export const preciosQueryKeys = {
  all: ['precios'] as const,
  lists: () => [...preciosQueryKeys.all, 'list'] as const,
  list: (page: number, limit: number) =>
    [...preciosQueryKeys.lists(), page, limit] as const,
  details: () => [...preciosQueryKeys.all, 'detail'] as const,
  detailByProducto: (productoId: number) =>
    [...preciosQueryKeys.details(), 'producto', productoId] as const,
  productOptions: () => [...preciosQueryKeys.all, 'product-options'] as const,
}
