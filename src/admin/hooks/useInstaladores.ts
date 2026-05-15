import { useQuery } from '@tanstack/react-query'

import { getInstaladores } from '../services/get-instaladores.service'
import { instalacionesQueryKeys } from './instalaciones-query-keys'

export const useInstaladores = () => {
  return useQuery({
    queryKey: instalacionesQueryKeys.instaladores(),
    queryFn: getInstaladores,
  })
}
