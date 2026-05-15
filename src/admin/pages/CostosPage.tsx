import { useState } from 'react'
import {
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Edit3,
  Loader2,
  PackageSearch,
  Percent,
  Search,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'

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
import { useAuthStore } from '@/auth/store/authStore'
import { getApiErrorMessage } from '@/lib/get-api-error-message'
import { AdminTopBar } from '../components/AdminTopBar'
import { useCreatePrecio } from '../hooks/useCreatePrecio'
import { usePrecios } from '../hooks/usePrecios'
import { useProductoPrecioOptions } from '../hooks/useProductoPrecioOptions'
import { useUpdatePrecioProducto } from '../hooks/useUpdatePrecioProducto'
import type {
  CreatePrecioPayload,
  PrecioItem,
  UpdatePrecioProductoPayload,
} from '../types/precios'

type PrecioPageSize = 10 | 20 | 30 | 'all'

interface PrecioFormErrors {
  id_producto?: string
  margen_ganancia?: string
}

const nativeFieldClassName =
  'flex min-h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40'

const PrecioTableSkeleton = () => (
  <div className="space-y-3 p-5">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((__, cellIndex) => (
          <Skeleton key={cellIndex} className="h-12 w-full" />
        ))}
      </div>
    ))}
  </div>
)

const PrecioDetailSkeleton = () => (
  <div className="space-y-5 py-6">
    <Skeleton className="h-28 w-full rounded-xl" />
    <div className="grid gap-3 sm:grid-cols-2">
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
    <Skeleton className="h-72 w-full rounded-xl" />
  </div>
)

const getInitialCreateFormState = (): CreatePrecioPayload => ({
  id_producto: 0,
  margen_ganancia: 0,
})

const getInitialFormState = (
  item: PrecioItem | null,
): UpdatePrecioProductoPayload => ({
  margen_ganancia: item?.margen_ganancia ?? 0,
})

const validateCreateForm = (values: CreatePrecioPayload) => {
  const errors: PrecioFormErrors = {}

  if (Number.isNaN(values.id_producto) || values.id_producto <= 0) {
    errors.id_producto = 'Selecciona un producto.'
  }

  if (Number.isNaN(values.margen_ganancia)) {
    errors.margen_ganancia = 'El margen de ganancia debe ser numerico.'
  } else if (values.margen_ganancia < 0) {
    errors.margen_ganancia = 'El margen de ganancia no puede ser menor a 0.'
  }

  return errors
}

const validateUpdateForm = (values: UpdatePrecioProductoPayload) => {
  const errors: PrecioFormErrors = {}

  if (Number.isNaN(values.margen_ganancia)) {
    errors.margen_ganancia = 'El margen de ganancia debe ser numerico.'
  } else if (values.margen_ganancia < 0) {
    errors.margen_ganancia = 'El margen de ganancia no puede ser menor a 0.'
  }

  return errors
}

export const CostosPage = () => {
  const user = useAuthStore((state) => state.user)
  const isRecepcion = user?.rol === 'RECEPCION'
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<PrecioPageSize>(10)
  const [selectedPrecio, setSelectedPrecio] = useState<PrecioItem | null>(null)
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formValues, setFormValues] =
    useState<UpdatePrecioProductoPayload | null>(null)
  const [formErrors, setFormErrors] = useState<PrecioFormErrors>({})
  const [createFormValues, setCreateFormValues] = useState<CreatePrecioPayload>(
    getInitialCreateFormState,
  )
  const [createFormErrors, setCreateFormErrors] = useState<PrecioFormErrors>({})

  const effectiveLimit = pageSize === 'all' ? 100 : pageSize
  const { data, error, isError, isFetching, isLoading, refetch } = usePrecios({
    page,
    limit: effectiveLimit,
  })
  const {
    data: productoOptions,
    isLoading: isLoadingProductoOptions,
    error: productoOptionsError,
  } = useProductoPrecioOptions()
  const createPrecio = useCreatePrecio()
  const updatePrecioProducto = useUpdatePrecioProducto()

  const items = data?.items ?? []
  const pagination = data?.pagination
  const totalPages = pagination?.totalPages ?? 1
  const currentPage = pagination?.page ?? page
  const hasPagination = totalPages > 1
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  )
  const selectedFormValues = formValues ?? getInitialFormState(selectedPrecio)
  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const filteredItems = items.filter((item) => {
    if (normalizedSearchTerm.length === 0) return true

    return (
      item.nombre_producto.toLowerCase().includes(normalizedSearchTerm) ||
      item.id_producto.toString().includes(normalizedSearchTerm) ||
      item.id.toString().includes(normalizedSearchTerm)
    )
  })

  const summary = filteredItems.reduce(
    (accumulator, item) => ({
      totalPrecios: accumulator.totalPrecios + 1,
      totalMargen: accumulator.totalMargen + item.margen_ganancia,
      totalPrecioSugerido:
        accumulator.totalPrecioSugerido + item.precio_sugerido,
    }),
    { totalPrecios: 0, totalMargen: 0, totalPrecioSugerido: 0 },
  )
  const averageMargin =
    summary.totalPrecios > 0 ? summary.totalMargen / summary.totalPrecios : 0
  const averageSuggestedPrice =
    summary.totalPrecios > 0
      ? summary.totalPrecioSugerido / summary.totalPrecios
      : 0

  const handleCloseCreateSheet = (open: boolean) => {
    setIsCreateSheetOpen(open)

    if (open) return

    setCreateFormValues(getInitialCreateFormState())
    setCreateFormErrors({})
  }

  const handleCloseSheet = (open: boolean) => {
    if (open) return

    setSelectedPrecio(null)
    setFormValues(null)
    setFormErrors({})
  }

  const handleCreateInputChange =
    (field: keyof CreatePrecioPayload) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = Number(event.target.value)

      setCreateFormValues((current) => ({
        ...current,
        [field]: value,
      }))

      setCreateFormErrors((current) => ({
        ...current,
        [field]: undefined,
      }))
    }

  const handleInputChange =
    (field: keyof UpdatePrecioProductoPayload) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(event.target.value)

      setFormValues((current) => ({
        ...(current ?? getInitialFormState(selectedPrecio)),
        [field]: value,
      }))

      setFormErrors((current) => ({
        ...current,
        [field]: undefined,
      }))
    }

  const handleCreateSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    if (isRecepcion) return

    const validationErrors = validateCreateForm(createFormValues)

    if (Object.keys(validationErrors).length > 0) {
      setCreateFormErrors(validationErrors)
      return
    }

    try {
      await createPrecio.mutateAsync({
        id_producto: createFormValues.id_producto,
        margen_ganancia: createFormValues.margen_ganancia,
      })

      setIsCreateSheetOpen(false)
      setCreateFormValues(getInitialCreateFormState())
      setCreateFormErrors({})

      toast.success('Precio creado', {
        description: 'El precio se registro correctamente.',
        duration: 3000,
      })
    } catch (mutationError) {
      toast.error('No se pudo crear el precio', {
        description: getApiErrorMessage(
          mutationError,
          'Revisa los datos e intenta de nuevo.',
        ),
        duration: 4000,
      })
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isRecepcion) return

    if (!selectedPrecio) return

    const validationErrors = validateUpdateForm(selectedFormValues)

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors)
      return
    }

    try {
      const updatedPrecio = await updatePrecioProducto.mutateAsync({
        idProducto: selectedPrecio.id_producto,
        payload: {
          margen_ganancia: selectedFormValues.margen_ganancia,
        },
      })

      if (updatedPrecio) {
        setSelectedPrecio(updatedPrecio)
        setFormValues(getInitialFormState(updatedPrecio))
        setFormErrors({})
      }

      toast.success('Precio actualizado', {
        description: 'Los cambios se guardaron correctamente.',
        duration: 3000,
      })
    } catch (mutationError) {
      toast.error('No se pudo actualizar el precio', {
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
        title="Costos y precios"
        breadcrumbs={[{ label: 'Costos y precios' }]}
        primaryAction={
          isRecepcion
            ? undefined
            : {
                label: 'Nuevo precio',
                onClick: () => setIsCreateSheetOpen(true),
              }
        }
      />

      <div className="space-y-5 p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              label: 'Margen promedio',
              value: `${averageMargin.toFixed(1)}%`,
              icon: Percent,
              tint: 'bg-success/10 text-success',
            },
            {
              label: 'Productos con precio',
              value: summary.totalPrecios.toString(),
              icon: DollarSign,
              tint: 'bg-info/10 text-info',
            },
            {
              label: 'Precio sugerido promedio',
              value: `$${averageSuggestedPrice.toFixed(2)}`,
              icon: TrendingUp,
              tint: 'bg-brand/10 text-brand',
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

        {isRecepcion ? (
          <Card className="border-border bg-warning/5 p-4 shadow-soft">
            <p className="text-sm font-medium text-foreground">
              Vista de solo lectura
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Recepción puede consultar costos y precios, pero no crear ni
              editar registros.
            </p>
          </Card>
        ) : null}

        <Card className="gap-0 overflow-hidden border-border bg-card p-0 shadow-soft">
          <div className="flex flex-col gap-3 border-b border-border p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por producto o ID..."
                className="h-8 bg-muted pl-8 text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <PrecioTableSkeleton />
            ) : isError ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <div className="space-y-1">
                  <p className="font-medium">
                    No se pudieron cargar los precios
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
                <DollarSign className="h-8 w-8 text-muted-foreground" />
                <p className="font-medium">No hay precios registrados</p>
                <p className="text-sm text-muted-foreground">
                  Crea un precio para comenzar a calcular margenes por producto.
                </p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-2 p-6 text-center">
                <PackageSearch className="h-8 w-8 text-muted-foreground" />
                <p className="font-medium">
                  No hay resultados para esa busqueda
                </p>
                <p className="text-sm text-muted-foreground">
                  Ajusta la busqueda para ver precios en esta pagina.
                </p>
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
                      <th className="px-5 py-3 text-left">ID producto</th>
                      <th className="px-5 py-3 text-right">Margen</th>
                      <th className="px-5 py-3 text-right">Precio sugerido</th>
                      <th className="px-5 py-3 text-right">ID precio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredItems.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedPrecio(item)}
                        className="cursor-pointer transition hover:bg-muted/40"
                      >
                        <td className="px-5 py-3.5">
                          <p className="font-medium">{item.nombre_producto}</p>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          #{item.id_producto}
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold tabular-nums">
                          {item.margen_ganancia}%
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold tabular-nums">
                          ${Number(item.precio_sugerido).toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5 text-right text-muted-foreground">
                          #{item.id}
                        </td>
                      </tr>
                    ))}
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
                        setPageSize(size as PrecioPageSize)
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
            <SheetTitle className="text-xl">Nuevo precio</SheetTitle>
            <SheetDescription>
              Asigna un margen de ganancia a un producto existente.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleCreateSubmit}
            className="space-y-5 px-5 py-6 sm:px-6"
          >
            <Card className="gap-4 border-border bg-card p-4">
              <div>
                <h4 className="text-sm font-semibold">
                  Informacion del precio
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Selecciona un producto y define el margen de ganancia.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nuevo-precio-producto">Producto</Label>
                <select
                  id="nuevo-precio-producto"
                  value={
                    createFormValues.id_producto > 0
                      ? createFormValues.id_producto
                      : ''
                  }
                  onChange={handleCreateInputChange('id_producto')}
                  aria-invalid={!!createFormErrors.id_producto}
                  disabled={createPrecio.isPending || isLoadingProductoOptions}
                  className={nativeFieldClassName}
                >
                  <option value="">Selecciona un producto</option>
                  {(productoOptions ?? []).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
                {productoOptionsError ? (
                  <p className="text-xs text-warning-foreground">
                    {getApiErrorMessage(
                      productoOptionsError,
                      'No se pudo cargar el listado de productos.',
                    )}
                  </p>
                ) : null}
                {createFormErrors.id_producto ? (
                  <p className="text-xs text-destructive">
                    {createFormErrors.id_producto}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nuevo-precio-margen">Margen de ganancia</Label>
                <Input
                  id="nuevo-precio-margen"
                  type="number"
                  min={0}
                  step="0.01"
                  value={createFormValues.margen_ganancia}
                  onChange={handleCreateInputChange('margen_ganancia')}
                  aria-invalid={!!createFormErrors.margen_ganancia}
                  disabled={createPrecio.isPending}
                />
                {createFormErrors.margen_ganancia ? (
                  <p className="text-xs text-destructive">
                    {createFormErrors.margen_ganancia}
                  </p>
                ) : null}
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
                  disabled={createPrecio.isPending}
                >
                  Restablecer
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createPrecio.isPending}
                >
                  {createPrecio.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />{' '}
                      Guardando...
                    </>
                  ) : (
                    'Crear precio'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={selectedPrecio !== null} onOpenChange={handleCloseSheet}>
        <SheetContent className="overflow-y-auto overflow-x-hidden">
          {!selectedPrecio ? null : isFetching ? (
            <div className="px-5 pb-6 sm:px-6">
              <PrecioDetailSkeleton />
            </div>
          ) : (
            <>
              <SheetHeader className="border-b border-border pb-5">
                <SheetTitle className="text-xl">
                  {selectedPrecio.nombre_producto}
                </SheetTitle>
                <SheetDescription className="font-mono text-xs">
                  Producto #{selectedPrecio.id_producto}
                </SheetDescription>
              </SheetHeader>

              <form
                onSubmit={handleSubmit}
                className="space-y-5 px-5 py-6 sm:px-6"
              >
                <div className="rounded-xl border border-border bg-gradient-to-br from-card to-muted p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Precio sugerido actual
                  </p>
                  <p className="mt-1 text-4xl font-semibold tabular-nums">
                    ${Number(selectedPrecio.precio_sugerido).toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ajusta el margen para recalcular el precio por producto.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Card className="gap-1 border-border bg-card p-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Percent className="h-3 w-3" /> Margen actual
                    </div>
                    <p className="text-sm font-semibold">
                      {selectedPrecio.margen_ganancia}%
                    </p>
                  </Card>
                  <Card className="gap-1 border-border bg-card p-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" /> Precio ID
                    </div>
                    <p className="text-sm font-semibold">
                      #{selectedPrecio.id}
                    </p>
                  </Card>
                </div>

                <Card className="gap-4 border-border bg-card p-4">
                  <div>
                    <h4 className="text-sm font-semibold">
                      {isRecepcion ? 'Detalle del margen' : 'Actualizar margen'}
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {isRecepcion
                        ? 'Consulta el margen y el precio sugerido de este producto.'
                        : 'Actualiza el margen de ganancia para este producto.'}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="precio-margen">Margen de ganancia</Label>
                    <Input
                      id="precio-margen"
                      type="number"
                      min={0}
                      step="0.01"
                      value={selectedFormValues.margen_ganancia}
                      onChange={handleInputChange('margen_ganancia')}
                      aria-invalid={!!formErrors.margen_ganancia}
                      disabled={isRecepcion || updatePrecioProducto.isPending}
                    />
                    {formErrors.margen_ganancia ? (
                      <p className="text-xs text-destructive">
                        {formErrors.margen_ganancia}
                      </p>
                    ) : null}
                  </div>
                </Card>

                <div className="sticky bottom-0 -mx-5 flex flex-col gap-3 border-t border-border bg-background/95 px-5 py-4 backdrop-blur sm:-mx-6 sm:px-6">
                  {isRecepcion ? null : (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormValues(getInitialFormState(selectedPrecio))
                          setFormErrors({})
                        }}
                        disabled={updatePrecioProducto.isPending}
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Restablecer
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={updatePrecioProducto.isPending}
                      >
                        {updatePrecioProducto.isPending ? (
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
                  )}
                </div>
              </form>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
