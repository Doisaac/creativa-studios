import { useQuery } from '@tanstack/react-query'
import { preciosQueryKeys } from './precios-query-keys'
import { getPreciosService } from '../services/get-precios.service'

interface UsePreciosParams {
  page: number
  limit: number
}

export const usePrecios = ({ page, limit }: UsePreciosParams) => {
  return useQuery({
    queryKey: preciosQueryKeys.list(page, limit),
    queryFn: () => getPreciosService({ page, limit }),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
  })
}
