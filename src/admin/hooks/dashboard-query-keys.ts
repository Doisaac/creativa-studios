export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  orders: () => [...dashboardQueryKeys.all, 'orders'] as const,
  ordersOverview: () => [...dashboardQueryKeys.orders(), 'overview'] as const,
  inventory: () => [...dashboardQueryKeys.all, 'inventory'] as const,
  inventoryOverview: () =>
    [...dashboardQueryKeys.inventory(), 'overview'] as const,
}
