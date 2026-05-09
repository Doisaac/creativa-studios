import { useState } from 'react'
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  Loader2,
  PackageSearch,
  Plus,
  Search,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/lib/get-api-error-message'
import { formatDateTime } from '@/lib/format-date'
import { cn } from '@/lib/utils'
import { AdminTopBar } from '../components/AdminTopBar'
import { useCreateMovimiento } from '../hooks/useCreateMovimiento'
import { useInventarioOptions } from '../hooks/useInventarioOptions'
import { useMovimientoById } from '../hooks/useMovimientoById'
import { useMovimientos } from '../hooks/useMovimientos'
import { useMovimientosByInventario } from '../hooks/useMovimientosByInventario'
import type {
  CrearMovimientoInventarioDTO,
  MovimientoInventario,
  TipoMovimientoInventario,
} from '../types/movimientos'

type MovimientoPageSize = 10 | 20 | 30 | 'all'
type MovimientoTipoFiltro = 'Todos' | TipoMovimientoInventario

interface MovimientoFormErrors {
  tipo?: string
  cantidad?: string
  id_inventario?: string
}

const movimientoBadgeClass: Record<TipoMovimientoInventario, string> = {
  entrada: 'bg-success/10 text-success border border-success/20',
  salida: 'bg-destructive/10 text-destructive border border-destructive/20',
  ajuste: 'bg-warning/15 text-warning-foreground border border-warning/30',
}

const movimientoIcon = {
  entrada: ArrowUp,
  salida: ArrowDown,
  ajuste: ArrowLeftRight,
} satisfies Record<
  TipoMovimientoInventario,
  React.ComponentType<{ className?: string }>
>

const nativeFieldClassName =
  'flex min-h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40'

const MovimientoTableSkeleton = () => (
  <div className="space-y-3 p-5">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="grid grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((__, cellIndex) => (
          <Skeleton key={cellIndex} className="h-12 w-full" />
        ))}
      </div>
    ))}
  </div>
)

const MovimientoDetailSkeleton = () => (
  <div className="space-y-5 py-6">
    <Skeleton className="h-28 w-full rounded-xl" />
    <div className="grid gap-3 sm:grid-cols-2">
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
    <Skeleton className="h-72 w-full rounded-xl" />
  </div>
)

const getInitialCreateFormState = (): CrearMovimientoInventarioDTO => ({
  tipo: 'entrada',
  cantidad: 1,
  id_inventario: 0,
  comentario: '',
})

const validateMovimientoForm = (values: CrearMovimientoInventarioDTO) => {
  const errors: MovimientoFormErrors = {}

  if (!['entrada', 'salida', 'ajuste'].includes(values.tipo)) {
    errors.tipo = 'Selecciona un tipo de movimiento valido.'
  }

  if (Number.isNaN(values.cantidad)) {
    errors.cantidad = 'La cantidad debe ser numerica.'
  } else if (values.cantidad <= 0) {
    errors.cantidad = 'La cantidad debe ser mayor a 0.'
  }

  if (Number.isNaN(values.id_inventario) || values.id_inventario <= 0) {
    errors.id_inventario = 'Selecciona un inventario.'
  }

  return errors
}

export const MovimientosPage = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<MovimientoPageSize>(10)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [tipoFilter, setTipoFilter] = useState<MovimientoTipoFiltro>('Todos')
  const [createFormValues, setCreateFormValues] =
    useState<CrearMovimientoInventarioDTO>(getInitialCreateFormState)
  const [createFormErrors, setCreateFormErrors] =
    useState<MovimientoFormErrors>({})

  const effectiveLimit = pageSize === 'all' ? 999 : pageSize
  const { data, error, isError, isFetching, isLoading, refetch } =
    useMovimientos({ page, limit: effectiveLimit })
  const {
    data: selectedMovimiento,
    error: detailError,
    isError: isDetailError,
    isLoading: isDetailLoading,
  } = useMovimientoById({ id: selectedId })
  const {
    data: relatedMovimientos,
    error: relatedError,
    isError: isRelatedError,
    isLoading: isRelatedLoading,
  } = useMovimientosByInventario({
    inventarioId: selectedMovimiento?.id_inventario ?? null,
  })
  const {
    data: inventarioOptions,
    isLoading: isLoadingInventarioOptions,
    error: inventarioOptionsError,
  } = useInventarioOptions()
  const createMovimiento = useCreateMovimiento()

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
    const matchesSearch =
      normalizedSearchTerm.length === 0 ||
      item.nombre_inventario.toLowerCase().includes(normalizedSearchTerm) ||
      item.id.toString().includes(normalizedSearchTerm) ||
      item.id_inventario.toString().includes(normalizedSearchTerm)
    const matchesTipo = tipoFilter === 'Todos' || item.tipo === tipoFilter

    return matchesSearch && matchesTipo
  })
  const hasActiveFilters =
    normalizedSearchTerm.length > 0 || tipoFilter !== 'Todos'

  const handleCloseCreateSheet = (open: boolean) => {
    setIsCreateSheetOpen(open)

    if (open) return

    setCreateFormValues(getInitialCreateFormState())
    setCreateFormErrors({})
  }

  const handleCreateInputChange =
    (field: keyof CrearMovimientoInventarioDTO) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const value =
        field === 'cantidad' || field === 'id_inventario'
          ? Number(event.target.value)
          : event.target.value

      setCreateFormValues((current) => ({
        ...current,
        [field]: value,
      }))

      setCreateFormErrors((current) => ({
        ...current,
        [field]: undefined,
      }))
    }

  const handleCreateSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    const validationErrors = validateMovimientoForm(createFormValues)

    if (Object.keys(validationErrors).length > 0) {
      setCreateFormErrors(validationErrors)
      return
    }

    try {
      await createMovimiento.mutateAsync({
        tipo: createFormValues.tipo,
        cantidad: createFormValues.cantidad,
        id_inventario: createFormValues.id_inventario,
        comentario: createFormValues.comentario?.trim() || undefined,
      })

      setIsCreateSheetOpen(false)
      setCreateFormValues(getInitialCreateFormState())
      setCreateFormErrors({})

      toast.success('Movimiento registrado', {
        description: 'El movimiento de inventario se creo correctamente.',
        duration: 3000,
      })
    } catch (mutationError) {
      toast.error('No se pudo crear el movimiento', {
        description: getApiErrorMessage(
          mutationError,
          'Revisa los datos e intenta de nuevo.',
        ),
        duration: 4000,
      })
    }
  }

  return (
    <>
      <AdminTopBar
        title="Movimientos de Inventario"
        breadcrumbs={[{ label: 'Movimientos de Inventario' }]}
        primaryAction={{
          label: 'Nuevo movimiento',
          onClick: () => setIsCreateSheetOpen(true),
        }}
      />

      <div className="space-y-5 p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              label: 'Movimientos visibles',
              value: filteredItems.length.toString(),
              icon: ClipboardList,
              tint: 'bg-info/10 text-info',
            },
            {
              label: 'Pagina actual',
              value: pagination ? `${currentPage}/${totalPages}` : '--',
              icon: PackageSearch,
              tint: 'bg-brand/10 text-brand',
            },
            {
              label: 'Registros totales',
              value: pagination?.total.toString() ?? '--',
              icon: Plus,
              tint: 'bg-success/10 text-success',
            },
          ].map((item) => (
            <Card
              key={item.label}
              className="flex-row items-center gap-4 border-border bg-card p-4 shadow-soft"
            >
              <span
                className={`grid h-10 w-10 place-items-center rounded-lg ${item.tint}`}
              >
                <item.icon className="h-4 w-4" />
              </span>
              <div>
                <div className="text-2xl font-semibold tracking-tight">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : item.value}
                </div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="gap-0 overflow-hidden border-border bg-card p-0 shadow-soft">
          <div className="flex flex-col gap-3 border-b border-border p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar por ID o inventario..."
                  className="h-8 bg-muted pl-8 text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <ArrowLeftRight className="h-3.5 w-3.5" /> Tipo
                </span>
                {(['Todos', 'entrada', 'salida', 'ajuste'] as const).map(
                  (tipo) => (
                    <Button
                      key={tipo}
                      variant={tipoFilter === tipo ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTipoFilter(tipo)}
                    >
                      {tipo}
                    </Button>
                  ),
                )}
                {hasActiveFilters ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('')
                      setTipoFilter('Todos')
                    }}
                  >
                    Limpiar filtros
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <MovimientoTableSkeleton />
            ) : isError ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <div className="space-y-1">
                  <p className="font-medium">
                    No se pudieron cargar los movimientos
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getApiErrorMessage(
                      error,
                      'Ocurrio un error al consultar la API.',
                    )}
                  </p>
                </div>
                <Button size="sm" onClick={() => void refetch()}>
                  Reintentar
                </Button>
              </div>
            ) : items.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-2 p-6 text-center">
                <ClipboardList className="h-8 w-8 text-muted-foreground" />
                <p className="font-medium">
                  No hay movimientos de inventario registrados
                </p>
                <p className="text-sm text-muted-foreground">
                  Cuando existan movimientos, apareceran listados aqui.
                </p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-2 p-6 text-center">
                <PackageSearch className="h-8 w-8 text-muted-foreground" />
                <p className="font-medium">
                  No hay resultados para esos filtros
                </p>
                <p className="text-sm text-muted-foreground">
                  Ajusta la busqueda o el tipo para ver movimientos en esta
                  pagina.
                </p>
                {hasActiveFilters ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('')
                      setTipoFilter('Todos')
                    }}
                  >
                    Limpiar filtros
                  </Button>
                ) : null}
              </div>
            ) : (
              <div className="relative">
                {isFetching ? (
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-border">
                    <div className="h-full w-full animate-pulse bg-primary/70" />
                  </div>
                ) : null}

                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/40 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 text-left">Movimiento</th>
                      <th className="px-5 py-3 text-left">Tipo</th>
                      <th className="px-5 py-3 text-left">Cantidad</th>
                      <th className="px-5 py-3 text-left">Inventario</th>
                      <th className="px-5 py-3 text-left">Comentario</th>
                      <th className="px-5 py-3 text-left">Fecha</th>
                      <th className="px-5 py-3 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredItems.map((item) => {
                      const MovimientoIcon = movimientoIcon[item.tipo]

                      return (
                        <tr
                          key={item.id}
                          className="transition hover:bg-muted/40"
                        >
                          <td className="px-5 py-3.5">
                            <p className="font-medium">Movimiento #{item.id}</p>
                            <p className="font-mono text-[11px] text-muted-foreground">
                              Inventario #{item.id_inventario}
                            </p>
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge
                              className={`${movimientoBadgeClass[item.tipo]} font-medium`}
                            >
                              <MovimientoIcon className="h-3 w-3" />
                              {item.tipo}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5 font-semibold tabular-nums">
                            {item.cantidad}
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="font-medium">
                              {item.nombre_inventario}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              ID #{item.id_inventario}
                            </p>
                          </td>
                          <td className="max-w-xs px-5 py-3.5 text-muted-foreground">
                            <span className="line-clamp-2">
                              {item.comentario?.trim() || 'Sin comentario'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground">
                            {formatDateTime(item.fecha_movimiento)}
                          </td>
                          <td className="px-5 py-3.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedId(item.id)}
                            >
                              <Eye className="h-3.5 w-3.5" /> Ver detalle
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {pagination && items.length > 0 ? (
            <div className="flex flex-col gap-3 border-t border-border px-5 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>
                Pagina {currentPage} de {totalPages}
              </span>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <div className="flex flex-wrap items-center gap-1">
                  <span>Mostrar</span>
                  {[10, 20, 30, 'all'].map((size) => (
                    <Button
                      key={size}
                      variant={pageSize === size ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setPage(1)
                        setPageSize(size as MovimientoPageSize)
                      }}
                      disabled={isFetching}
                    >
                      {size === 'all' ? 'Todos' : size}
                    </Button>
                  ))}
                </div>
                <span>{filteredItems.length} visibles en esta pagina</span>
                <span>{pagination.total} registros en total</span>

                {hasPagination ? (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1 || isFetching}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>

                    {pageNumbers.map((pageNumber) => (
                      <Button
                        key={pageNumber}
                        variant={
                          pageNumber === currentPage ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => setPage(pageNumber)}
                        disabled={isFetching}
                        className="min-w-8"
                      >
                        {pageNumber}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages || isFetching}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      <Sheet open={isCreateSheetOpen} onOpenChange={handleCloseCreateSheet}>
        <SheetContent className="overflow-y-auto overflow-x-hidden">
          <SheetHeader className="border-b border-border pb-5">
            <SheetTitle className="text-xl">Nuevo movimiento</SheetTitle>
            <SheetDescription>
              Registra una entrada, salida o ajuste para un item del inventario.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleCreateSubmit}
            className="space-y-5 px-5 py-6 sm:px-6"
          >
            <Card className="gap-4 border-border bg-card p-4">
              <div>
                <h4 className="text-sm font-semibold">
                  Informacion del movimiento
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Completa los datos requeridos para registrar el movimiento.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nuevo-movimiento-tipo">Tipo</Label>
                <select
                  id="nuevo-movimiento-tipo"
                  value={createFormValues.tipo}
                  onChange={handleCreateInputChange('tipo')}
                  aria-invalid={!!createFormErrors.tipo}
                  disabled={createMovimiento.isPending}
                  className={nativeFieldClassName}
                >
                  <option value="entrada">entrada</option>
                  <option value="salida">salida</option>
                  <option value="ajuste">ajuste</option>
                </select>
                {createFormErrors.tipo ? (
                  <p className="text-xs text-destructive">
                    {createFormErrors.tipo}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nuevo-movimiento-cantidad">Cantidad</Label>
                <Input
                  id="nuevo-movimiento-cantidad"
                  type="number"
                  min={1}
                  value={createFormValues.cantidad}
                  onChange={handleCreateInputChange('cantidad')}
                  aria-invalid={!!createFormErrors.cantidad}
                  disabled={createMovimiento.isPending}
                />
                {createFormErrors.cantidad ? (
                  <p className="text-xs text-destructive">
                    {createFormErrors.cantidad}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nuevo-movimiento-inventario">Inventario</Label>
                <select
                  id="nuevo-movimiento-inventario"
                  value={
                    createFormValues.id_inventario > 0
                      ? createFormValues.id_inventario
                      : ''
                  }
                  onChange={handleCreateInputChange('id_inventario')}
                  aria-invalid={!!createFormErrors.id_inventario}
                  disabled={
                    createMovimiento.isPending || isLoadingInventarioOptions
                  }
                  className={nativeFieldClassName}
                >
                  <option value="">Selecciona un inventario</option>
                  {(inventarioOptions ?? []).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
                {inventarioOptionsError ? (
                  <p className="text-xs text-warning-foreground">
                    {getApiErrorMessage(
                      inventarioOptionsError,
                      'No se pudo cargar el listado de inventario.',
                    )}
                  </p>
                ) : null}
                {createFormErrors.id_inventario ? (
                  <p className="text-xs text-destructive">
                    {createFormErrors.id_inventario}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nuevo-movimiento-comentario">Comentario</Label>
                <textarea
                  id="nuevo-movimiento-comentario"
                  value={createFormValues.comentario ?? ''}
                  onChange={handleCreateInputChange('comentario')}
                  disabled={createMovimiento.isPending}
                  className={cn(nativeFieldClassName, 'min-h-24 resize-y')}
                  placeholder="Comentario opcional"
                />
              </div>
            </Card>

            <div className="sticky bottom-0 -mx-5 flex flex-col gap-3 border-t border-border bg-background/95 px-5 py-4 backdrop-blur sm:-mx-6 sm:px-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCreateFormValues(getInitialCreateFormState())
                    setCreateFormErrors({})
                  }}
                  disabled={createMovimiento.isPending}
                >
                  Restablecer
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createMovimiento.isPending}
                >
                  {createMovimiento.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />{' '}
                      Guardando...
                    </>
                  ) : (
                    'Crear movimiento'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet
        open={selectedId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId(null)
          }
        }}
      >
        <SheetContent className="overflow-y-auto overflow-x-hidden">
          {isDetailLoading ? (
            <div className="px-5 pb-6 sm:px-6">
              <MovimientoDetailSkeleton />
            </div>
          ) : isDetailError ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-5 py-8 text-center sm:px-6">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div className="space-y-1">
                <p className="font-medium">No se pudo cargar el detalle</p>
                <p className="text-sm text-muted-foreground">
                  {getApiErrorMessage(
                    detailError,
                    'Ocurrio un error al consultar el movimiento.',
                  )}
                </p>
              </div>
              <Button size="sm" onClick={() => setSelectedId(null)}>
                Cerrar
              </Button>
            </div>
          ) : selectedMovimiento ? (
            <>
              <SheetHeader className="border-b border-border pb-5">
                <Badge
                  className={`${movimientoBadgeClass[selectedMovimiento.tipo]} w-fit font-medium`}
                >
                  {selectedMovimiento.tipo}
                </Badge>
                <SheetTitle className="text-xl">
                  Movimiento #{selectedMovimiento.id}
                </SheetTitle>
                <SheetDescription className="font-mono text-xs">
                  Inventario #{selectedMovimiento.id_inventario}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-5 px-5 py-6 sm:px-6">
                <div className="rounded-xl border border-border bg-gradient-to-br from-card to-muted p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Inventario relacionado
                  </p>
                  <p className="mt-1 text-xl font-semibold">
                    {selectedMovimiento.nombre_inventario}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Historial de movimientos del inventario asociado.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Card className="gap-1 border-border bg-card p-4">
                    <div className="text-xs text-muted-foreground">
                      Cantidad
                    </div>
                    <p className="text-sm font-semibold tabular-nums">
                      {selectedMovimiento.cantidad}
                    </p>
                  </Card>
                  <Card className="gap-1 border-border bg-card p-4">
                    <div className="text-xs text-muted-foreground">Fecha</div>
                    <p className="text-sm font-semibold">
                      {formatDateTime(selectedMovimiento.fecha_movimiento)}
                    </p>
                  </Card>
                </div>

                <Card className="gap-4 border-border bg-card p-4">
                  <div>
                    <h4 className="text-sm font-semibold">
                      Comentario del movimiento
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedMovimiento.comentario?.trim() ||
                        'Sin comentario'}
                    </p>
                  </div>
                </Card>

                <Card className="gap-4 border-border bg-card p-4">
                  <div>
                    <h4 className="text-sm font-semibold">
                      Movimientos del mismo inventario
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Consulta rapida usando el endpoint por inventario.
                    </p>
                  </div>

                  {isRelatedLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton
                          key={index}
                          className="h-14 w-full rounded-lg"
                        />
                      ))}
                    </div>
                  ) : isRelatedError ? (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                      {getApiErrorMessage(
                        relatedError,
                        'No se pudo cargar el historial del inventario.',
                      )}
                    </div>
                  ) : relatedMovimientos && relatedMovimientos.length > 0 ? (
                    <div className="space-y-2">
                      {relatedMovimientos.map((item: MovimientoInventario) => {
                        const RelatedIcon = movimientoIcon[item.tipo]
                        const isCurrent = item.id === selectedMovimiento.id

                        return (
                          <div
                            key={item.id}
                            className={cn(
                              'rounded-lg border border-border p-3 transition',
                              isCurrent && 'border-primary/30 bg-primary/5',
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="font-medium">
                                  Movimiento #{item.id}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDateTime(item.fecha_movimiento)}
                                </p>
                              </div>
                              <Badge
                                className={`${movimientoBadgeClass[item.tipo]} font-medium`}
                              >
                                <RelatedIcon className="h-3 w-3" />
                                {item.tipo}
                              </Badge>
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                              <span className="font-semibold tabular-nums">
                                Cantidad: {item.cantidad}
                              </span>
                              {isCurrent ? (
                                <span className="text-xs font-medium text-primary">
                                  Seleccionado
                                </span>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setSelectedId(item.id)}
                                >
                                  Ver este
                                </Button>
                              )}
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {item.comentario?.trim() || 'Sin comentario'}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                      No hay mas movimientos asociados a este inventario.
                    </div>
                  )}
                </Card>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  )
}
