import { getPedidosService } from './get-pedidos.service'
import type { DashboardOrdersOverview } from '../types/dashboard'

const DASHBOARD_PAGE_SIZE = 100

export const getDashboardOrdersOverviewService =
  async (): Promise<DashboardOrdersOverview> => {
    const firstPage = await getPedidosService({
      page: 1,
      limit: DASHBOARD_PAGE_SIZE,
    })

    const totalPages = firstPage.pagination.totalPages

    if (totalPages <= 1) {
      return {
        pedidos: firstPage.items,
        total: firstPage.pagination.total,
      }
    }

    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        getPedidosService({
          page: index + 2,
          limit: DASHBOARD_PAGE_SIZE,
        }),
      ),
    )

    const pedidos = [firstPage, ...remainingPages].flatMap((page) => page.items)

    return {
      pedidos,
      total: firstPage.pagination.total,
    }
  }
