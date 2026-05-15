import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { updateInstalacionEstado } from '../services/update-instalacion-estado.service'
import type { UpdateInstalacionEstadoPayload } from '../types/instalaciones'
import { instalacionesQueryKeys } from './instalaciones-query-keys'
import { pedidosQueryKeys } from './pedidos-query-keys'

interface UpdateInstalacionEstadoVariables {
  id: number
  payload: UpdateInstalacionEstadoPayload
}

export const useUpdateInstalacionEstado = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: UpdateInstalacionEstadoVariables) =>
      updateInstalacionEstado(id, payload),

    onSuccess: async (instalacion) => {
      toast.success('Estado de instalación actualizado correctamente')

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: instalacionesQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: pedidosQueryKeys.all,
        }),
      ])

      if (instalacion?.id) {
        await queryClient.invalidateQueries({
          queryKey: instalacionesQueryKeys.detail(instalacion.id),
        })
      }
    },

    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al actualizar estado de instalación'

      toast.error(message)
    },
  })
}
