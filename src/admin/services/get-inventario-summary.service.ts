import { creativaApi } from '@/api/creativa-api'
import type {
  InventarioItem,
  InventarioResponse,
  InventarioSummary,
} from '../types/inventario'

const buildInventorySummary = (items: InventarioItem[]): InventarioSummary => ({
  totalProducts: items.length,
  totalStock: items.reduce((total, item) => total + item.stock_actual, 0),
  lowStock: items.filter((item) => item.bajo_stock).length,
  outOfStock: items.filter((item) => item.stock_actual === 0).length,
})

const getInventarioPage = async (page: number) => {
  const { data } = await creativaApi.get<InventarioResponse>('/inventario', {
    params: { page },
  })

  return data.data
}

export const getInventarioSummaryService = async () => {
  const firstPage = await getInventarioPage(1)
  const totalPages = firstPage.pagination.totalPages

  if (totalPages <= 1) {
    return buildInventorySummary(firstPage.items)
  }

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      getInventarioPage(index + 2),
    ),
  )

  const allItems = [firstPage, ...remainingPages].flatMap((page) => page.items)

  return buildInventorySummary(allItems)
}
