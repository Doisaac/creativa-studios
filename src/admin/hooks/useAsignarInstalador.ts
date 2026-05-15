import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { asignarInstalador } from '../services/asignar-instalador.service'
import type { AsignarInstaladorPayload } from '../types/instalaciones'
import { instalacionesQueryKeys } from './instalaciones-query-keys'

interface AsignarInstaladorVariables {
  id: number
  payload: AsignarInstaladorPayload
}

export const useAsignarInstalador = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: AsignarInstaladorVariables) =>
      asignarInstalador(id, payload),

    onSuccess: async (instalacion) => {
      toast.success('Instalador asignado correctamente')

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
        error instanceof Error ? error.message : 'Error al asignar instalador'

      toast.error(message)
    },
  })
}
