import { getInventarioService } from './get-inventario.service'
import type { DashboardInventoryOverview } from '../types/dashboard'

const DASHBOARD_PAGE_SIZE = 100

export const getDashboardInventoryOverviewService =
  async (): Promise<DashboardInventoryOverview> => {
    const firstPage = await getInventarioService({
      page: 1,
      limit: DASHBOARD_PAGE_SIZE,
    })

    const totalPages = firstPage.pagination.totalPages

    if (totalPages <= 1) {
      return {
        items: firstPage.items,
        total: firstPage.pagination.total,
      }
    }

    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        getInventarioService({
          page: index + 2,
          limit: DASHBOARD_PAGE_SIZE,
        }),
      ),
    )

    const items = [firstPage, ...remainingPages].flatMap((page) => page.items)

    return {
      items,
      total: firstPage.pagination.total,
    }
  }
