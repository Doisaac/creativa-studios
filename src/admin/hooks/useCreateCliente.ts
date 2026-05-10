import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clientesQueryKeys } from './clientes-query-keys'
import { createClienteService } from '../services/create-cliente.service'

export const useCreateCliente = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createClienteService,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: clientesQueryKeys.all }),
      ])
    },
  })
}
