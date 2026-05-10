import { useQuery } from '@tanstack/react-query'
import { dashboardQueryKeys } from './dashboard-query-keys'
import { getDashboardOrdersOverviewService } from '../services/get-dashboard-orders-overview.service'

export const useDashboardOrdersOverview = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.ordersOverview(),
    queryFn: getDashboardOrdersOverviewService,
    staleTime: 1000 * 60 * 3,
  })
}
