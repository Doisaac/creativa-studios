import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { createInstalacion } from '../services/create-instalacion.service'
import type { CreateInstalacionPayload } from '../types/instalaciones'
import { instalacionesQueryKeys } from './instalaciones-query-keys'
import { pedidosQueryKeys } from './pedidos-query-keys'

interface CreateInstalacionVariables {
  idPedido: number
  payload: CreateInstalacionPayload
}

export const useCreateInstalacion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ idPedido, payload }: CreateInstalacionVariables) =>
      createInstalacion(idPedido, payload),

    onSuccess: async () => {
      toast.success('Instalación creada correctamente')

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: instalacionesQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: pedidosQueryKeys.all,
        }),
      ])
    },

    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Error al crear instalación'

      toast.error(message)
    },
  })
}
