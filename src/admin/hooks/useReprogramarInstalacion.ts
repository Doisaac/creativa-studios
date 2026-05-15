import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { reprogramarInstalacion } from '../services/reprogramar-instalacion.service'
import type { ReprogramarInstalacionPayload } from '../types/instalaciones'
import { instalacionesQueryKeys } from './instalaciones-query-keys'

interface ReprogramarInstalacionVariables {
  id: number
  payload: ReprogramarInstalacionPayload
}

export const useReprogramarInstalacion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: ReprogramarInstalacionVariables) =>
      reprogramarInstalacion(id, payload),

    onSuccess: async (instalacion) => {
      toast.success('Instalación reprogramada correctamente')

      await queryClient.invalidateQueries({
        queryKey: instalacionesQueryKeys.all,
      })

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
          : 'Error al reprogramar instalación'

      toast.error(message)
    },
  })
}
