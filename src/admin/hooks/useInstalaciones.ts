import { useQuery } from '@tanstack/react-query'

import { getInstalaciones } from '../services/get-instalaciones.service'
import type { InstalacionesFilters } from '../types/instalaciones'
import { instalacionesQueryKeys } from './instalaciones-query-keys'

export const useInstalaciones = (filters: InstalacionesFilters = {}) => {
  return useQuery({
    queryKey: instalacionesQueryKeys.list(filters),
    queryFn: () => getInstalaciones(filters),
  })
}
