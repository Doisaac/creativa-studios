import { useQuery } from '@tanstack/react-query'

import { getMisInstalaciones } from '../services/get-mis-instalaciones.service'
import type { InstalacionesFilters } from '../types/instalaciones'
import { instalacionesQueryKeys } from './instalaciones-query-keys'

export const useMisInstalaciones = (filters: InstalacionesFilters = {}) => {
  return useQuery({
    queryKey: instalacionesQueryKeys.myList(filters),
    queryFn: () => getMisInstalaciones(filters),
  })
}
