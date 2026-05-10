import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clientesQueryKeys } from './clientes-query-keys'
import { updateClienteService } from '../services/update-cliente.service'

export const useUpdateCliente = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateClienteService,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: clientesQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: clientesQueryKeys.detail(variables.id),
        }),
      ])
    },
  })
}
