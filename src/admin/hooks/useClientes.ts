import { useQuery } from '@tanstack/react-query'
import { clientesQueryKeys } from './clientes-query-keys'
import { getClientesService } from '../services/get-clientes.service'

interface UseClientesParams {
  page: number
  limit: number
  search?: string
}

export const useClientes = ({ page, limit, search }: UseClientesParams) => {
  return useQuery({
    queryKey: clientesQueryKeys.list(page, limit, search),
    queryFn: () => getClientesService({ page, limit, search }),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5,
  })
}
