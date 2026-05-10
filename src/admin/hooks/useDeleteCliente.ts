import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clientesQueryKeys } from './clientes-query-keys'
import { deleteClienteService } from '../services/delete-cliente.service'

export const useDeleteCliente = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteClienteService,
    onSuccess: async (_, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: clientesQueryKeys.all }),
        queryClient.removeQueries({ queryKey: clientesQueryKeys.detail(id) }),
      ])
    },
  })
}
