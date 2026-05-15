import { useMemo, useState, type ChangeEvent } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  Loader2,
  MapPin,
  PlayCircle,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/lib/get-api-error-message'
import { cn } from '@/lib/utils'
import { AdminTopBar } from '../components/AdminTopBar'
import { useMisInstalaciones } from '../hooks/useMisInstalaciones'
import { useUpdateInstalacionEstado } from '../hooks/useUpdateInstalacionEstado'
import type {
  InstalacionEstado,
  InstalacionListItem,
} from '../types/instalaciones'

type MisInstalacionesPageSize = 10 | 20 | 30 | 'all'
type InstalacionEstadoFiltro = 'Todos' | InstalacionEstado

const nativeFieldClassName =
  'flex min-h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40'

const estadoLabel: Record<InstalacionEstado, string> = {
  pendiente: 'Pendiente',
  asignada: 'Asignada',
  en_proceso: 'En proceso',
  completada: 'Completada',
  no_realizada: 'No realizada',
  cancelada: 'Cancelada',
}

const estadoBadgeClass: Record<InstalacionEstado, string> = {
  pendiente: 'border-warning/30 bg-warning/15 text-warning-foreground',
  asignada: 'border-brand/20 bg-brand-muted text-brand',
  en_proceso: 'border-info/20 bg-info/10 text-info',
  completada: 'border-success/20 bg-success/10 text-success',
  no_realizada: 'border-warning/30 bg-warning/15 text-warning-foreground',
  cancelada: 'border-destructive/20 bg-destructive/10 text-destructive',
}

const pedidoEstadoBadgeClass: Record<string, string> = {
  pendiente: 'border-warning/30 bg-warning/15 text-warning-foreground',
  produccion: 'border-info/20 bg-info/10 text-info',
  finalizado: 'border-brand/20 bg-brand-muted text-brand',
  entregado: 'border-success/20 bg-success/10 text-success',
  cancelado: 'border-destructive/20 bg-destructive/10 text-destructive',
}

const formatDate = (value: string | null) => {
  if (!value) return 'Sin fecha'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-SV', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

const formatDateTime = (value: string | null) => {
  if (!value) return 'Sin registrar'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Sin registrar'

  return new Intl.DateTimeFormat('es-SV', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const getClienteName = (item: InstalacionListItem) =>
  item.cliente_nombre_comercial?.trim() || item.cliente_nombre_contacto

const MisInstalacionesSkeleton = () => (
  <div className="grid gap-4 p-5 lg:grid-cols-2">
    {Array.from({ length: 4 }).map((_, index) => (
      <Skeleton key={index} className="h-64 w-full rounded-2xl" />
    ))}
  </div>
)

export const MisInstalacionesPage = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<MisInstalacionesPageSize>(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] =
    useState<InstalacionEstadoFiltro>('Todos')
  const [selectedInstalacion, setSelectedInstalacion] =
    useState<InstalacionListItem | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const effectiveLimit = pageSize === 'all' ? 100 : pageSize

  const filters = useMemo(
    () => ({
      page,
      limit: effectiveLimit,
      estado: estadoFilter === 'Todos' ? undefined : estadoFilter,
    }),
    [effectiveLimit, estadoFilter, page],
  )

  const { data, error, isError, isFetching, isLoading, refetch } =
    useMisInstalaciones(filters)
  const updateEstado = useUpdateInstalacionEstado()

  const items = data?.items ?? []
  const pagination = data?.pagination
  const totalPages = pagination?.totalPages ?? 1
  const currentPage = pagination?.page ?? page
  const hasPagination = totalPages > 1
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  )

  const normalizedSearchTerm = searchTerm.trim().toLowerCase()

  const filteredItems = items.filter((item) => {
    if (!normalizedSearchTerm) return true

    return (
      item.id.toString().includes(normalizedSearchTerm) ||
      item.id_pedido.toString().includes(normalizedSearchTerm) ||
      getClienteName(item).toLowerCase().includes(normalizedSearchTerm) ||
      item.cliente_telefono.toLowerCase().includes(normalizedSearchTerm) ||
      item.direccion_instalacion.toLowerCase().includes(normalizedSearchTerm)
    )
  })

  const hasActiveFilters =
    normalizedSearchTerm.length > 0 || estadoFilter !== 'Todos'

  const handleEstadoFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setEstadoFilter(event.target.value as InstalacionEstadoFiltro)
    setPage(1)
  }

  const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value

    setPageSize(
      value === 'all' ? 'all' : (Number(value) as MisInstalacionesPageSize),
    )
    setPage(1)
  }

  const handleOpenDetail = (instalacion: InstalacionListItem) => {
    setSelectedInstalacion(instalacion)
    setIsDetailOpen(true)
  }

  const handleUpdateEstado = async (
    instalacion: InstalacionListItem,
    estado: InstalacionEstado,
    observaciones: string,
  ) => {
    try {
      await updateEstado.mutateAsync({
        id: instalacion.id,
        payload: {
          estado,
          observaciones,
        },
      })
    } catch {
      // El hook ya muestra el error.
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminTopBar
        title="Mis instalaciones"
        breadcrumbs={[{ label: 'Mis instalaciones' }]}
      />

      <main className="p-4 sm:p-6">
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card className="border-border p-4">
            <p className="text-sm text-muted-foreground">Asignadas a mí</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {pagination?.total ?? 0}
            </p>
          </Card>

          <Card className="border-border p-4">
            <p className="text-sm text-muted-foreground">En proceso</p>
            <p className="mt-2 text-3xl font-bold text-info">
              {items.filter((item) => item.estado === 'en_proceso').length}
            </p>
          </Card>

          <Card className="border-border p-4">
            <p className="text-sm text-muted-foreground">Completadas</p>
            <p className="mt-2 text-3xl font-bold text-success">
              {items.filter((item) => item.estado === 'completada').length}
            </p>
          </Card>
        </div>

        <Card className="overflow-hidden border-border">
          <div className="border-b border-border p-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Trabajos asignados
                </h2>
                <p className="text-sm text-muted-foreground">
                  Solo se muestran las instalaciones asignadas a tu usuario.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => void refetch()}
                disabled={isFetching}
              >
                {isFetching ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Actualizar
              </Button>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_220px_160px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar por cliente, pedido, teléfono o dirección..."
                  className="pl-9"
                />
              </div>

              <select
                value={estadoFilter}
                onChange={handleEstadoFilterChange}
                className={nativeFieldClassName}
              >
                <option value="Todos">Todos los estados</option>
                <option value="asignada">Asignada</option>
                <option value="en_proceso">En proceso</option>
                <option value="completada">Completada</option>
                <option value="no_realizada">No realizada</option>
                <option value="cancelada">Cancelada</option>
              </select>

              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className={nativeFieldClassName}
              >
                <option value={10}>10 por página</option>
                <option value={20}>20 por página</option>
                <option value={30}>30 por página</option>
                <option value="all">Ver más</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <MisInstalacionesSkeleton />
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
              <AlertTriangle className="h-10 w-10 text-destructive" />
              <div>
                <p className="font-semibold text-foreground">
                  No se pudieron cargar tus instalaciones
                </p>
                <p className="text-sm text-muted-foreground">
                  {getApiErrorMessage(
                    error,
                    'Ocurrió un error al obtener tus instalaciones.',
                  )}
                </p>
              </div>
              <Button variant="outline" onClick={() => void refetch()}>
                Reintentar
              </Button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
              <ClipboardList className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-semibold text-foreground">
                  {hasActiveFilters
                    ? 'No hay instalaciones con esos filtros'
                    : 'No tienes instalaciones asignadas'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Cuando recepción o administración te asignen instalaciones,
                  aparecerán aquí.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 p-4 lg:grid-cols-2">
              {filteredItems.map((item) => (
                <Card key={item.id} className="border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Instalación #{item.id}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-foreground">
                        {getClienteName(item)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Pedido #{item.id_pedido}
                      </p>
                    </div>

                    <Badge
                      className={cn('w-fit', estadoBadgeClass[item.estado])}
                      variant="outline"
                    >
                      {estadoLabel[item.estado]}
                    </Badge>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-border p-3">
                      <p className="text-xs text-muted-foreground">
                        Fecha programada
                      </p>
                      <p className="mt-1 font-medium text-foreground">
                        {formatDate(item.fecha_programada)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-border p-3">
                      <p className="text-xs text-muted-foreground">
                        Estado del pedido
                      </p>
                      <Badge
                        className={cn(
                          'mt-1 w-fit',
                          pedidoEstadoBadgeClass[item.pedido_estado] ??
                            'border-border bg-muted text-muted-foreground',
                        )}
                        variant="outline"
                      >
                        {item.pedido_estado}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-border p-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Dirección
                        </p>
                        <p className="text-sm text-foreground">
                          {item.direccion_instalacion}
                        </p>
                      </div>
                    </div>
                  </div>

                  {item.observaciones && (
                    <div className="mt-4 rounded-xl bg-muted/40 p-3">
                      <p className="text-xs text-muted-foreground">
                        Observaciones
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {item.observaciones}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDetail(item)}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Ver
                    </Button>

                    {item.estado === 'asignada' && (
                      <Button
                        size="sm"
                        onClick={() =>
                          void handleUpdateEstado(
                            item,
                            'en_proceso',
                            'Instalación iniciada',
                          )
                        }
                        disabled={updateEstado.isPending}
                      >
                        <PlayCircle className="mr-1 h-4 w-4" />
                        Iniciar
                      </Button>
                    )}

                    {item.estado === 'en_proceso' && (
                      <Button
                        size="sm"
                        onClick={() =>
                          void handleUpdateEstado(
                            item,
                            'completada',
                            'Instalación realizada correctamente',
                          )
                        }
                        disabled={updateEstado.isPending}
                      >
                        <CheckCircle2 className="mr-1 h-4 w-4" />
                        Completar
                      </Button>
                    )}

                    {['asignada', 'en_proceso'].includes(item.estado) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          void handleUpdateEstado(
                            item,
                            'no_realizada',
                            'Instalación marcada como no realizada',
                          )
                        }
                        disabled={updateEstado.isPending}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        No realizada
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {hasPagination && (
            <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </p>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Anterior
                </Button>

                {pageNumbers.map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    type="button"
                    variant={pageNumber === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setPage((current) => Math.min(current + 1, totalPages))
                  }
                >
                  Siguiente
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>

      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Detalle de instalación</SheetTitle>
            <SheetDescription>
              Revisa los datos completos del trabajo asignado.
            </SheetDescription>
          </SheetHeader>

          {selectedInstalacion && (
            <div className="mt-6 space-y-4">
              <Card className="border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Instalación</p>
                    <p className="text-2xl font-bold text-foreground">
                      #{selectedInstalacion.id}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Pedido #{selectedInstalacion.id_pedido}
                    </p>
                  </div>

                  <Badge
                    className={cn(
                      'w-fit',
                      estadoBadgeClass[selectedInstalacion.estado],
                    )}
                    variant="outline"
                  >
                    {estadoLabel[selectedInstalacion.estado]}
                  </Badge>
                </div>
              </Card>

              <Card className="border-border p-4">
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="mt-1 font-semibold text-foreground">
                  {getClienteName(selectedInstalacion)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedInstalacion.cliente_nombre_contacto}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedInstalacion.cliente_telefono}
                </p>
              </Card>

              <Card className="border-border p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">
                      Dirección de instalación
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedInstalacion.direccion_instalacion}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border-border p-4">
                <p className="font-medium text-foreground">Fechas</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Programada</p>
                    <p className="text-sm text-foreground">
                      {formatDate(selectedInstalacion.fecha_programada)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Realizada</p>
                    <p className="text-sm text-foreground">
                      {formatDateTime(selectedInstalacion.fecha_realizada)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border-border p-4">
                <p className="font-medium text-foreground">Observaciones</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {selectedInstalacion.observaciones ||
                    'Sin observaciones registradas.'}
                </p>
              </Card>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
