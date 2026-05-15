import { useQuery } from '@tanstack/react-query'

import { getInstalacionById } from '../services/get-instalacion-by-id.service'
import { instalacionesQueryKeys } from './instalaciones-query-keys'

export const useInstalacionById = (id: number) => {
  return useQuery({
    queryKey: instalacionesQueryKeys.detail(id),
    queryFn: () => getInstalacionById(id),
    enabled: Number.isInteger(id) && id > 0,
  })
}
