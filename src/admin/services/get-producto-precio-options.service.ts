import { creativaApi } from '@/api/creativa-api'
import {
  buildProductoPrecioOptions,
  type ProductoResponse,
} from '../types/productos'

const getProductosPage = async (page: number) => {
  const { data } = await creativaApi.get<ProductoResponse>('/producto', {
    params: { page },
  })

  return data.data
}

export const getProductoPrecioOptionsService = async () => {
  const firstPage = await getProductosPage(1)
  const totalPages = firstPage.pagination.totalPages

  if (totalPages <= 1) {
    return buildProductoPrecioOptions(firstPage)
  }

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      getProductosPage(index + 2),
    ),
  )

  return [firstPage, ...remainingPages].flatMap((page) =>
    buildProductoPrecioOptions(page),
  )
}
