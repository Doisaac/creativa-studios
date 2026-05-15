import type { InstalacionesFilters } from '../types/instalaciones'

export const instalacionesQueryKeys = {
  all: ['instalaciones'] as const,

  lists: () => [...instalacionesQueryKeys.all, 'list'] as const,

  list: (filters: InstalacionesFilters) =>
    [...instalacionesQueryKeys.lists(), filters] as const,

  myLists: () => [...instalacionesQueryKeys.all, 'mis-instalaciones'] as const,

  myList: (filters: InstalacionesFilters) =>
    [...instalacionesQueryKeys.myLists(), filters] as const,

  detail: (id: number) =>
    [...instalacionesQueryKeys.all, 'detail', id] as const,

  instaladores: () => [...instalacionesQueryKeys.all, 'instaladores'] as const,
}
