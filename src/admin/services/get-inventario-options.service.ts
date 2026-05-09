import { creativaApi } from '@/api/creativa-api'
import type { InventarioResponse } from '../types/inventario'
import type { InventarioOption } from '../types/movimientos'

const getInventarioPage = async (page: number) => {
  const { data } = await creativaApi.get<InventarioResponse>('/inventario', {
    params: { page },
  })

  return data.data
}

export const getInventarioOptionsService = async (): Promise<
  InventarioOption[]
> => {
  const firstPage = await getInventarioPage(1)
  const totalPages = firstPage.pagination.totalPages

  if (totalPages <= 1) {
    return firstPage.items.map(({ id, nombre }) => ({ id, nombre }))
  }

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      getInventarioPage(index + 2),
    ),
  )

  return [firstPage, ...remainingPages]
    .flatMap((page) => page.items)
    .map(({ id, nombre }) => ({ id, nombre }))
}
