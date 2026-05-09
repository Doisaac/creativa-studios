import { useQuery } from '@tanstack/react-query'
import { preciosQueryKeys } from './precios-query-keys'
import { getProductoPrecioOptionsService } from '../services/get-producto-precio-options.service'

export const useProductoPrecioOptions = () => {
  return useQuery({
    queryKey: preciosQueryKeys.productOptions(),
    queryFn: getProductoPrecioOptionsService,
    staleTime: 1000 * 60 * 5,
  })
}
