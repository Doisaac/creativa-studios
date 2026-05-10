import { useQuery } from '@tanstack/react-query'
import { clientesQueryKeys } from './clientes-query-keys'
import { getClienteByIdService } from '../services/get-cliente-by-id.service'

interface UseClienteByIdParams {
  id?: number | null
}

export const useClienteById = ({ id }: UseClienteByIdParams) => {
  const clienteId = id ?? 0

  return useQuery({
    queryKey: clientesQueryKeys.detail(clienteId),
    queryFn: () => getClienteByIdService(clienteId),
    enabled: clienteId > 0,
    staleTime: 1000 * 60 * 5,
  })
}
