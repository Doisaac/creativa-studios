import { useState } from 'react'
import {
  AlertTriangle,
  Boxes,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Filter,
  Loader2,
  Search,
  Trash,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import { AdminTopBar } from '../components/AdminTopBar'
import { useDeleteInventario } from '../hooks/useDeleteInventario'
import { useInventario } from '../hooks/useInventario'
import { useInventarioById } from '../hooks/useInventarioById'
import { useInventarioSummary } from '../hooks/useInventarioSummary'
import { useUpdateInventario } from '../hooks/useUpdateInventario'
import type {
  InventarioItem,
  UpdateInventarioPayload,
} from '../types/inventario'

type Stock = 'En stock' | 'Bajo stock' | 'Agotado'
type InventoryStatusFilter = 'Todos' | Stock
type InventoryPageSize = 10 | 20 | 30 | 'all'

interface InventarioFormErrors {
  nombre?: string
  stock_minimo?: string
  unidad_de_medida?: string
}

const stockColor: Record<Stock, string> = {
  'En stock': 'bg-success/10 text-success border border-success/20',
  'Bajo stock':
    'bg-warning/15 text-warning-foreground border border-warning/30',
  Agotado: 'bg-destructive/10 text-destructive border border-destructive/20',
}

const EL_SALVADOR_TIME_ZONE = 'America/El_Salvador'

const getStockStatus = (item: InventarioItem): Stock => {
  if (item.stock_actual <= 0) return 'Agotado'
  if (item.bajo_stock) return 'Bajo stock'

  return 'En stock'
}

const formatInventoryDate = (date?: string | null) => {
  if (!date) {
    return 'Fecha no disponible'
  }

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Fecha no disponible'
  }

  try {
    return parsedDate.toLocaleString('es-SV', {
      timeZone: EL_SALVADOR_TIME_ZONE,
      dateStyle: 'medium',
      timeStyle: 'short',
      hour12: true,
    })
  } catch {
    return 'Fecha no disponible'
  }
}

const InventoryTableSkeleton = () => (
  <div className="space-y-3 p-5">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="grid grid-cols-5 gap-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    ))}
  </div>
)

const InventoryDetailSkeleton = () => (
  <div className="space-y-5 py-6">
    <Skeleton className="h-28 w-full rounded-xl" />
    <div className="grid gap-3 sm:grid-cols-2">
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
    <Skeleton className="h-72 w-full rounded-xl" />
  </div>
)

const getInitialFormState = (
  item: InventarioItem | null,
): UpdateInventarioPayload => ({
  nombre: item?.nombre ?? '',
  stock_minimo: item?.stock_minimo ?? 0,
  unidad_de_medida: item?.unidad_de_medida ?? '',
})

const validateInventarioForm = (values: UpdateInventarioPayload) => {
  const errors: InventarioFormErrors = {}

  if (!values.nombre.trim()) {
    errors.nombre = 'El nombre es requerido.'
  }

  if (!values.unidad_de_medida.trim()) {
    errors.unidad_de_medida = 'La unidad de medida es requerida.'
  }

  if (Number.isNaN(values.stock_minimo)) {
    errors.stock_minimo = 'El stock mínimo debe ser numérico.'
  } else if (values.stock_minimo < 0) {
    errors.stock_minimo = 'El stock mínimo no puede ser menor a 0.'
  }

  return errors
}

export const InventarioPage = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<InventoryPageSize>(10)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<InventoryStatusFilter>('Todos')
  const [formValues, setFormValues] = useState<UpdateInventarioPayload | null>(
    null,
  )
  const [formErrors, setFormErrors] = useState<InventarioFormErrors>({})

  const { data: summary, isLoading: isSummaryLoading } = useInventarioSummary()
  const effectiveLimit =
    pageSize === 'all' ? (summary?.totalProducts ?? 10) : pageSize
  const { data, error, isError, isFetching, isLoading, refetch } =
    useInventario({ page, limit: effectiveLimit })
  const {
    data: selectedItem,
    error: detailError,
    isError: isDetailError,
    isLoading: isDetailLoading,
  } = useInventarioById({ id: selectedId })
  const updateInventario = useUpdateInventario()
  const deleteInventario = useDeleteInventario()

  const items = data?.items ?? []
  const pagination = data?.pagination
  const totalPages = pagination?.totalPages ?? 1
  const currentPage = pagination?.page ?? page
  const hasPagination = totalPages > 1
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  )
  const selectedFormValues =
    formValues ?? getInitialFormState(selectedItem ?? null)
  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const filteredItems = items.filter((item) => {
    const matchesName =
      normalizedSearchTerm.length === 0 ||
      item.nombre.toLowerCase().includes(normalizedSearchTerm)
    const status = getStockStatus(item)
    const matchesStatus = statusFilter === 'Todos' || status === statusFilter

    return matchesName && matchesStatus
  })
  const hasActiveFilters =
    normalizedSearchTerm.length > 0 || statusFilter !== 'Todos'

  const handleCloseSheet = (open: boolean) => {
    if (open) return

    setSelectedId(null)
    setIsDeleteDialogOpen(false)
    setFormValues(null)
    setFormErrors({})
  }

  const handleInputChange =
    (field: keyof UpdateInventarioPayload) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === 'stock_minimo'
          ? Number(event.target.value)
          : event.target.value

      setFormValues((current) => ({
        ...(current ?? getInitialFormState(selectedItem ?? null)),
        [field]: value,
      }))

      setFormErrors((current) => ({
        ...current,
        [field]: undefined,
      }))
    }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedId) return

    const validationErrors = validateInventarioForm(selectedFormValues)

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors)
      return
    }

    try {
      await updateInventario.mutateAsync({
        id: selectedId,
        payload: {
          nombre: selectedFormValues.nombre.trim(),
          stock_minimo: selectedFormValues.stock_minimo,
          unidad_de_medida: selectedFormValues.unidad_de_medida.trim(),
        },
      })

      setFormValues(null)
      setFormErrors({})

      toast.success('Inventario actualizado', {
        description: 'Los cambios se guardaron correctamente.',
        duration: 3000,
      })
    } catch (mutationError) {
      toast.error('No se pudo actualizar el inventario', {
        description: getApiErrorMessage(
          mutationError,
          'Revisa los datos e intenta de nuevo.',
        ),
        duration: 4000,
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedId || !selectedItem) return

    try {
      await deleteInventario.mutateAsync(selectedId)

      setIsDeleteDialogOpen(false)
      setSelectedId(null)
      setFormValues(null)
      setFormErrors({})

      toast.success('Material eliminado', {
        description: 'El inventario se eliminó correctamente.',
        duration: 3000,
      })
    } catch (mutationError) {
      toast.error('No se pudo eliminar el material', {
        description: getApiErrorMessage(
          mutationError,
          'Intenta nuevamente dentro de unos segundos.',
        ),
        duration: 4000,
      })
    }
  }

  return (
    <>
      <AdminTopBar
        title="Inventario"
        breadcrumbs={[{ label: 'Inventario' }]}
        primaryAction={{ label: 'Nuevo producto' }}
      />

      <div className="space-y-5 p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            {
              label: 'Total productos',
              value: summary?.totalProducts.toString() ?? '--',
              icon: Boxes,
              tint: 'bg-info/10 text-info',
            },
            {
              label: 'Stock total',
              value: summary?.totalStock.toString() ?? '--',
              icon: Boxes,
              tint: 'bg-success/10 text-success',
            },
            {
              label: 'Bajo stock',
              value: summary?.lowStock.toString() ?? '--',
              icon: AlertTriangle,
              tint: 'bg-warning/15 text-warning-foreground',
            },
            {
              label: 'Agotados',
              value: summary?.outOfStock.toString() ?? '--',
              icon: AlertTriangle,
              tint: 'bg-destructive/10 text-destructive',
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
                  {isSummaryLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    item.value
                  )}
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
                  placeholder="Buscar producto por nombre..."
                  className="h-8 bg-muted pl-8 text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Filter className="h-3.5 w-3.5" /> Estado
                </span>
                {(['Todos', 'En stock', 'Bajo stock', 'Agotado'] as const).map(
                  (status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                    >
                      {status}
                    </Button>
                  ),
                )}
                {hasActiveFilters ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('Todos')
                    }}
                  >
                    Limpiar filtros
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-3.5 w-3.5" /> Exportar
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <InventoryTableSkeleton />
            ) : isError ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <div className="space-y-1">
                  <p className="font-medium">No se pudo cargar el inventario</p>
                  <p className="text-sm text-muted-foreground">
                    {getApiErrorMessage(
                      error,
                      'Ocurrió un error al consultar la API.',
                    )}
                  </p>
                </div>
                <Button size="sm" onClick={() => void refetch()}>
                  Reintentar
                </Button>
              </div>
            ) : items.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-2 p-6 text-center">
                <Boxes className="h-8 w-8 text-muted-foreground" />
                <p className="font-medium">No hay inventario registrado</p>
                <p className="text-sm text-muted-foreground">
                  Cuando existan productos, aparecerán listados aquí.
                </p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-2 p-6 text-center">
                <Filter className="h-8 w-8 text-muted-foreground" />
                <p className="font-medium">
                  No hay resultados para esos filtros
                </p>
                <p className="text-sm text-muted-foreground">
                  Ajusta la busqueda o el estado para ver productos en esta
                  pagina.
                </p>
                {hasActiveFilters ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('Todos')
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
                      <th className="px-5 py-3 text-left">Producto</th>
                      <th className="px-5 py-3 text-left">Stock</th>
                      <th className="px-5 py-3 text-left">Mínimo</th>
                      <th className="px-5 py-3 text-left">Estado</th>
                      <th className="px-5 py-3 text-left">Unidad</th>
                      <th className="px-5 py-3 text-left">Creado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredItems.map((item) => {
                      const status = getStockStatus(item)
                      const progress = Math.min(
                        100,
                        (item.stock_actual /
                          Math.max(item.stock_minimo * 2, 1)) *
                          100,
                      )

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedId(item.id)}
                          className="cursor-pointer transition hover:bg-muted/40"
                        >
                          <td className="px-5 py-3.5">
                            <p className="font-medium">{item.nombre}</p>
                            <p className="font-mono text-[11px] text-muted-foreground">
                              ID #{item.id}
                            </p>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold tabular-nums">
                                {item.stock_actual}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {item.unidad_de_medida}
                              </span>
                            </div>
                            <div className="mt-1.5 h-1 w-24 overflow-hidden rounded-full bg-muted">
                              <div
                                className={`h-full rounded-full ${status === 'Agotado' ? 'bg-destructive' : status === 'Bajo stock' ? 'bg-warning' : 'bg-success'}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground">
                            {item.stock_minimo}
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge
                              className={`${stockColor[status]} font-medium`}
                            >
                              {status}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground">
                            {item.unidad_de_medida}
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground">
                            {formatInventoryDate(item.created_at)}
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
                Página {currentPage} de {totalPages}
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
                        setPageSize(size as InventoryPageSize)
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

      <Sheet open={selectedId !== null} onOpenChange={handleCloseSheet}>
        <SheetContent className="overflow-y-auto overflow-x-hidden">
          {isDetailLoading ? (
            <div className="px-5 pb-6 sm:px-6">
              <InventoryDetailSkeleton />
            </div>
          ) : isDetailError ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-5 py-8 text-center sm:px-6">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div className="space-y-1">
                <p className="font-medium">No se pudo cargar el detalle</p>
                <p className="text-sm text-muted-foreground">
                  {getApiErrorMessage(
                    detailError,
                    'Ocurrió un error al consultar el material.',
                  )}
                </p>
              </div>
              <Button size="sm" onClick={() => setSelectedId(null)}>
                Cerrar
              </Button>
            </div>
          ) : selectedItem ? (
            <>
              <SheetHeader className="border-b border-border pb-5">
                <Badge
                  className={`${stockColor[getStockStatus(selectedItem)]} w-fit font-medium`}
                >
                  {getStockStatus(selectedItem)}
                </Badge>
                <SheetTitle className="text-xl">
                  {selectedItem.nombre}
                </SheetTitle>
                <SheetDescription className="font-mono text-xs">
                  ID #{selectedItem.id}
                </SheetDescription>
              </SheetHeader>

              <form
                onSubmit={handleSubmit}
                className="space-y-5 px-5 py-6 sm:px-6"
              >
                <div className="rounded-xl border border-border bg-gradient-to-br from-card to-muted p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Stock actual
                  </p>
                  <p className="mt-1 text-4xl font-semibold tabular-nums">
                    {selectedItem.stock_actual}{' '}
                    <span className="text-base font-normal text-muted-foreground">
                      {selectedItem.unidad_de_medida}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Solo lectura. El stock actual no se modifica desde este
                    formulario.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Card className="gap-1 border-border bg-card p-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Boxes className="h-3 w-3" /> Unidad actual
                    </div>
                    <p className="text-sm font-semibold">
                      {selectedItem.unidad_de_medida}
                    </p>
                  </Card>
                  <Card className="gap-1 border-border bg-card p-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" /> Fecha de registro
                    </div>
                    <p className="text-sm font-semibold">
                      {formatInventoryDate(selectedItem.created_at)}
                    </p>
                  </Card>
                </div>

                <Card className="gap-4 border-border bg-card p-4">
                  <div>
                    <h4 className="text-sm font-semibold">Editar material</h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Puedes actualizar nombre, stock mínimo y unidad de medida.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="inventario-nombre">Nombre</Label>
                    <Input
                      id="inventario-nombre"
                      value={selectedFormValues.nombre}
                      onChange={handleInputChange('nombre')}
                      aria-invalid={!!formErrors.nombre}
                      disabled={
                        updateInventario.isPending || deleteInventario.isPending
                      }
                    />
                    {formErrors.nombre ? (
                      <p className="text-xs text-destructive">
                        {formErrors.nombre}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="inventario-stock-minimo">
                      Stock mínimo
                    </Label>
                    <Input
                      id="inventario-stock-minimo"
                      type="number"
                      min={0}
                      value={selectedFormValues.stock_minimo}
                      onChange={handleInputChange('stock_minimo')}
                      aria-invalid={!!formErrors.stock_minimo}
                      disabled={
                        updateInventario.isPending || deleteInventario.isPending
                      }
                    />
                    {formErrors.stock_minimo ? (
                      <p className="text-xs text-destructive">
                        {formErrors.stock_minimo}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="inventario-unidad">Unidad de medida</Label>
                    <Input
                      id="inventario-unidad"
                      value={selectedFormValues.unidad_de_medida}
                      onChange={handleInputChange('unidad_de_medida')}
                      aria-invalid={!!formErrors.unidad_de_medida}
                      disabled={
                        updateInventario.isPending || deleteInventario.isPending
                      }
                    />
                    {formErrors.unidad_de_medida ? (
                      <p className="text-xs text-destructive">
                        {formErrors.unidad_de_medida}
                      </p>
                    ) : null}
                  </div>
                </Card>

                <div className="sticky bottom-0 -mx-5 flex flex-col gap-3 border-t border-border bg-background/95 px-5 py-4 backdrop-blur sm:-mx-6 sm:px-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      disabled={
                        updateInventario.isPending || deleteInventario.isPending
                      }
                      className="sm:self-start"
                    >
                      <Trash className="h-3.5 w-3.5" /> Eliminar
                    </Button>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormValues(null)
                          setFormErrors({})
                        }}
                        disabled={
                          updateInventario.isPending ||
                          deleteInventario.isPending
                        }
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Restablecer
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={
                          updateInventario.isPending ||
                          deleteInventario.isPending
                        }
                      >
                        {updateInventario.isPending ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />{' '}
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Edit3 className="h-3.5 w-3.5" /> Guardar cambios
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar material</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedItem
                ? `Se eliminará "${selectedItem.nombre}". Esta acción no se puede deshacer.`
                : 'Esta acción no se puede deshacer.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteInventario.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                void handleDelete()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteInventario.isPending}
            >
              {deleteInventario.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
