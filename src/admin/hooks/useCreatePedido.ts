import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pedidosQueryKeys } from './pedidos-query-keys'
import { createPedidoService } from '../services/create-pedido.service'

export const useCreatePedido = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPedidoService,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: pedidosQueryKeys.all,
      })
    },
  })
}
