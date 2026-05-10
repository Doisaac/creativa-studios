import { useQuery } from '@tanstack/react-query'
import { dashboardQueryKeys } from './dashboard-query-keys'
import { getDashboardInventoryOverviewService } from '../services/get-dashboard-inventory-overview.service'

export const useDashboardInventoryOverview = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.inventoryOverview(),
    queryFn: getDashboardInventoryOverviewService,
    staleTime: 1000 * 60 * 5,
  })
}
