import { useState } from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  AlertTriangle,
  Box,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Loader2,
  PackageSearch,
  Plus,
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
import { useAuthStore } from '@/auth/store/authStore'
import { getApiErrorMessage } from '@/lib/get-api-error-message'
import { formatDateTime } from '@/lib/format-date'
import { AdminTopBar } from '../components/AdminTopBar'
import { useCreateProducto } from '../hooks/useCreateProducto'
import { useDeleteProducto } from '../hooks/useDeleteProducto'
import { useInventarioOptions } from '../hooks/useInventarioOptions'
import { useProductoById } from '../hooks/useProductoById'
import { useProductos } from '../hooks/useProductos'
import { useUpdateProducto } from '../hooks/useUpdateProducto'
import type {
  CreateProductoPayload,
  ProductoItem,
  UpdateProductoPayload,
} from '../types/productos'

type ProductoPageSize = 10 | 20 | 30 | 'all'

interface ProductoFormErrors {
  nombre?: string
  tipo?: string
  costo_base?: string
  codigo?: string
  id_insumo_inventario?: string
}

const nativeFieldClassName =
  'flex min-h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40'

const productoTypeClassName: Record<string, string> = {
  insumo: 'bg-info/10 text-info border border-info/20',
  producto: 'bg-success/10 text-success border border-success/20',
  servicio: 'bg-warning/15 text-warning-foreground border border-warning/30',
}

const ProductoTableSkeleton = () => (
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

const ProductoDetailSkeleton = () => (
  <div className="space-y-5 py-6">
    <Skeleton className="h-28 w-full rounded-xl" />
    <div className="grid gap-3 sm:grid-cols-2">
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
    <Skeleton className="h-80 w-full rounded-xl" />
  </div>
)

const getInitialCreateFormState = (): CreateProductoPayload => ({
  nombre: '',
  tipo: 'producto',
  costo_base: 0,
  codigo: '',
  id_insumo_inventario: 0,
})

const getInitialFormState = (
  item: ProductoItem | null,
): UpdateProductoPayload => ({
  nombre: item?.nombre ?? '',
  tipo: item?.tipo ?? 'insumo',
  costo_base: item ? Number(item.costo_base) : 0,
  codigo: item?.codigo ?? '',
  id_insumo_inventario: item?.id_insumo_inventario ?? 0,
})

const validateProductoForm = (
  values: CreateProductoPayload | UpdateProductoPayload,
) => {
  const errors: ProductoFormErrors = {}

  if (!values.nombre.trim()) {
    errors.nombre = 'El nombre es requerido.'
  }

  if (!values.tipo.trim()) {
    errors.tipo = 'El tipo es requerido.'
  }

  if (Number.isNaN(values.costo_base)) {
    errors.costo_base = 'El costo base debe ser numerico.'
  } else if (values.costo_base < 0) {
    errors.costo_base = 'El costo base no puede ser menor a 0.'
  }

  if (!values.codigo.trim()) {
    errors.codigo = 'El codigo es requerido.'
  }

  if (
    Number.isNaN(values.id_insumo_inventario) ||
    values.id_insumo_inventario <= 0
  ) {
    errors.id_insumo_inventario = 'Selecciona un inventario.'
  }

  return errors
}

export const ProductoPage = () => {
  const user = useAuthStore((state) => state.user)
  const isRecepcion = user?.rol === 'RECEPCION'
  const isReadOnlyRole = isRecepcion || user?.rol === 'PRODUCCION'
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<ProductoPageSize>(10)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formValues, setFormValues] = useState<UpdateProductoPayload | null>(
    null,
  )
  const [formErrors, setFormErrors] = useState<ProductoFormErrors>({})
  const [createFormValues, setCreateFormValues] =
    useState<CreateProductoPayload>(getInitialCreateFormState)
  const [createFormErrors, setCreateFormErrors] = useState<ProductoFormErrors>(
    {},
  )

  const effectiveLimit = pageSize === 'all' ? 100 : pageSize
  const { data, error, isError, isFetching, isLoading, refetch } = useProductos(
    { page, limit: effectiveLimit },
  )
  const {
    data: selectedProducto,
    error: detailError,
    isError: isDetailError,
    isLoading: isDetailLoading,
  } = useProductoById({ id: selectedId })
  const {
    data: inventarioOptions,
    isLoading: isLoadingInventarioOptions,
    error: inventarioOptionsError,
  } = useInventarioOptions()
  const createProducto = useCreateProducto()
  const updateProducto = useUpdateProducto()
  const deleteProducto = useDeleteProducto()

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
    formValues ?? getInitialFormState(selectedProducto ?? null)
  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const filteredItems = items.filter((item) => {
    if (normalizedSearchTerm.length === 0) return true

    return (
      item.nombre.toLowerCase().includes(normalizedSearchTerm) ||
      item.codigo.toLowerCase().includes(normalizedSearchTerm) ||
      item.nombre_insumo_inventario
        .toLowerCase()
        .includes(normalizedSearchTerm) ||
      item.id.toString().includes(normalizedSearchTerm)
    )
  })

  const handleExportPdf = async () => {
    if (filteredItems.length === 0 || isExporting) {
      return
    }

    try {
      setIsExporting(true)

      const document = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })
      const exportedAt = formatDateTime(new Date().toISOString())

      document.setFontSize(16)
      document.text('Productos', 14, 16)
      document.setFontSize(10)
      document.text(`Exportado: ${exportedAt}`, 14, 22)
      document.text(`Registros visibles: ${filteredItems.length}`, 14, 27)

      autoTable(document, {
        startY: 32,
        head: [
          [
            'ID',
            'Nombre',
            'Tipo',
            'Costo base',
            'Codigo',
            'Insumo relacionado',
            'Creado',
          ],
        ],
        body: filteredItems.map((item) => [
          item.id.toString(),
          item.nombre,
          item.tipo,
          `$${Number(item.costo_base).toFixed(2)}`,
          item.codigo,
          `${item.nombre_insumo_inventario} (#${item.id_insumo_inventario})`,
          formatDateTime(item.created_at),
        ]),
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        margin: { left: 14, right: 14, bottom: 14 },
      })

      const fileDate = new Date().toISOString().slice(0, 10)
      document.save(`productos-${fileDate}.pdf`)
    } catch (exportError) {
      toast.error('No se pudo exportar el PDF', {
        description: getApiErrorMessage(
          exportError,
          'Intenta nuevamente dentro de unos segundos.',
        ),
        duration: 4000,
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleCloseCreateSheet = (open: boolean) => {
    setIsCreateSheetOpen(open)

    if (open) return

    setCreateFormValues(getInitialCreateFormState())
    setCreateFormErrors({})
  }

  const handleCloseSheet = (open: boolean) => {
    if (open) return

    setSelectedId(null)
    setIsDeleteDialogOpen(false)
    setFormValues(null)
    setFormErrors({})
  }

  const handleInputChange =
    (field: keyof UpdateProductoPayload) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const value =
        field === 'costo_base' || field === 'id_insumo_inventario'
          ? Number(event.target.value)
          : event.target.value

      setFormValues((current) => ({
        ...(current ?? getInitialFormState(selectedProducto ?? null)),
        [field]: value,
      }))

      setFormErrors((current) => ({
        ...current,
        [field]: undefined,
      }))
    }

  const handleCreateInputChange =
    (field: keyof CreateProductoPayload) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const value =
        field === 'costo_base' || field === 'id_insumo_inventario'
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
    if (isReadOnlyRole) return

    const validationErrors = validateProductoForm(createFormValues)

    if (Object.keys(validationErrors).length > 0) {
      setCreateFormErrors(validationErrors)
      return
    }

    try {
      await createProducto.mutateAsync({
        nombre: createFormValues.nombre.trim(),
        tipo: createFormValues.tipo.trim(),
        costo_base: createFormValues.costo_base,
        codigo: createFormValues.codigo.trim(),
        id_insumo_inventario: createFormValues.id_insumo_inventario,
      })

      setIsCreateSheetOpen(false)
      setCreateFormValues(getInitialCreateFormState())
      setCreateFormErrors({})

      toast.success('Producto creado', {
        description: 'El producto se registro correctamente.',
        duration: 3000,
      })
    } catch (mutationError) {
      toast.error('No se pudo crear el producto', {
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
    if (isReadOnlyRole) return

    if (!selectedId) return

    const validationErrors = validateProductoForm(selectedFormValues)

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors)
      return
    }

    try {
      await updateProducto.mutateAsync({
        id: selectedId,
        payload: {
          nombre: selectedFormValues.nombre.trim(),
          tipo: selectedFormValues.tipo.trim(),
          costo_base: selectedFormValues.costo_base,
          codigo: selectedFormValues.codigo.trim(),
          id_insumo_inventario: selectedFormValues.id_insumo_inventario,
        },
      })

      toast.success('Producto actualizado', {
        description: 'Los cambios se guardaron correctamente.',
        duration: 3000,
      })
    } catch (mutationError) {
      toast.error('No se pudo actualizar el producto', {
        description: getApiErrorMessage(
          mutationError,
          'Revisa los datos e intenta de nuevo.',
        ),
        duration: 4000,
      })
    }
  }

  const handleDelete = async () => {
    if (isReadOnlyRole) return
    if (!selectedId || !selectedProducto) return

    try {
      await deleteProducto.mutateAsync(selectedId)

      setIsDeleteDialogOpen(false)
      setSelectedId(null)
      setFormValues(null)
      setFormErrors({})

      toast.success('Producto eliminado', {
        description: 'El producto se elimino correctamente.',
        duration: 3000,
      })
    } catch (mutationError) {
      toast.error('No se pudo eliminar el producto', {
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
        title="Productos"
        breadcrumbs={[{ label: 'Productos' }]}
        primaryAction={
          isReadOnlyRole
            ? undefined
            : {
                label: 'Nuevo producto',
                onClick: () => setIsCreateSheetOpen(true),
              }
        }
      />

      <div className="space-y-5 p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              label: 'Productos visibles',
              value: filteredItems.length.toString(),
              icon: Box,
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

        {isReadOnlyRole ? (
          <Card className="border-border bg-warning/5 p-4 shadow-soft">
            <p className="text-sm font-medium text-foreground">
              Vista de solo lectura
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Recepción y Producción pueden consultar productos, pero no crear,
              editar ni eliminar registros.
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
                placeholder="Buscar por nombre, codigo o inventario..."
                className="h-8 bg-muted pl-8 text-xs"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleExportPdf()}
                disabled={
                  filteredItems.length === 0 || isExporting || isLoading
                }
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />{' '}
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" /> Exportar
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <ProductoTableSkeleton />
            ) : isError ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <div className="space-y-1">
                  <p className="font-medium">
                    No se pudieron cargar los productos
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
                <Box className="h-8 w-8 text-muted-foreground" />
                <p className="font-medium">No hay productos registrados</p>
                <p className="text-sm text-muted-foreground">
                  Cuando existan productos, apareceran listados aqui.
                </p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-2 p-6 text-center">
                <PackageSearch className="h-8 w-8 text-muted-foreground" />
                <p className="font-medium">
                  No hay resultados para esa busqueda
                </p>
                <p className="text-sm text-muted-foreground">
                  Ajusta la busqueda para ver productos en esta pagina.
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
                      <th className="px-5 py-3 text-left">ID</th>
                      <th className="px-5 py-3 text-left">Nombre</th>
                      <th className="px-5 py-3 text-left">Tipo</th>
                      <th className="px-5 py-3 text-left">Costo base</th>
                      <th className="px-5 py-3 text-left">Codigo</th>
                      <th className="px-5 py-3 text-left">
                        Insumo relacionado
                      </th>
                      <th className="px-5 py-3 text-left">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredItems.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedId(item.id)}
                        className="cursor-pointer transition hover:bg-muted/40"
                      >
                        <td className="px-5 py-3.5">
                          <p className="font-medium">#{item.id}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium">{item.nombre}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge
                            className={`${productoTypeClassName[item.tipo] ?? 'bg-muted text-foreground border border-border'} font-medium`}
                          >
                            {item.tipo}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 font-semibold tabular-nums">
                          ${Number(item.costo_base).toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          <span className="font-mono text-xs">
                            {item.codigo}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium">
                            {item.nombre_insumo_inventario}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            ID #{item.id_insumo_inventario}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {formatDateTime(item.created_at)}
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
                        setPageSize(size as ProductoPageSize)
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
            <SheetTitle className="text-xl">Nuevo producto</SheetTitle>
            <SheetDescription>
              Registra un producto y vincula el insumo de inventario asociado.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleCreateSubmit}
            className="space-y-5 px-5 py-6 sm:px-6"
          >
            <Card className="gap-4 border-border bg-card p-4">
              <div>
                <h4 className="text-sm font-semibold">
                  Informacion del producto
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Completa los datos requeridos para registrar el producto.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nuevo-producto-nombre">Nombre</Label>
                <Input
                  id="nuevo-producto-nombre"
                  value={createFormValues.nombre}
                  onChange={handleCreateInputChange('nombre')}
                  aria-invalid={!!createFormErrors.nombre}
                  disabled={createProducto.isPending}
                />
                {createFormErrors.nombre ? (
                  <p className="text-xs text-destructive">
                    {createFormErrors.nombre}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nuevo-producto-tipo">Tipo</Label>
                <select
                  id="nuevo-producto-tipo"
                  value={createFormValues.tipo}
                  onChange={handleCreateInputChange('tipo')}
                  aria-invalid={!!createFormErrors.tipo}
                  disabled={createProducto.isPending}
                  className={nativeFieldClassName}
                >
                  <option value="producto">producto</option>
                  <option value="servicio">servicio</option>
                </select>
                {createFormErrors.tipo ? (
                  <p className="text-xs text-destructive">
                    {createFormErrors.tipo}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nuevo-producto-costo-base">Costo base</Label>
                <Input
                  id="nuevo-producto-costo-base"
                  type="number"
                  min={0}
                  step="0.01"
                  value={createFormValues.costo_base}
                  onChange={handleCreateInputChange('costo_base')}
                  aria-invalid={!!createFormErrors.costo_base}
                  disabled={createProducto.isPending}
                />
                {createFormErrors.costo_base ? (
                  <p className="text-xs text-destructive">
                    {createFormErrors.costo_base}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nuevo-producto-codigo">Codigo</Label>
                <Input
                  id="nuevo-producto-codigo"
                  value={createFormValues.codigo}
                  onChange={handleCreateInputChange('codigo')}
                  aria-invalid={!!createFormErrors.codigo}
                  disabled={createProducto.isPending}
                />
                {createFormErrors.codigo ? (
                  <p className="text-xs text-destructive">
                    {createFormErrors.codigo}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nuevo-producto-inventario">
                  Insumo de inventario
                </Label>
                <select
                  id="nuevo-producto-inventario"
                  value={
                    createFormValues.id_insumo_inventario > 0
                      ? createFormValues.id_insumo_inventario
                      : ''
                  }
                  onChange={handleCreateInputChange('id_insumo_inventario')}
                  aria-invalid={!!createFormErrors.id_insumo_inventario}
                  disabled={
                    createProducto.isPending || isLoadingInventarioOptions
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
                {createFormErrors.id_insumo_inventario ? (
                  <p className="text-xs text-destructive">
                    {createFormErrors.id_insumo_inventario}
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
                  disabled={createProducto.isPending}
                >
                  Restablecer
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createProducto.isPending}
                >
                  {createProducto.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />{' '}
                      Guardando...
                    </>
                  ) : (
                    'Crear producto'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={selectedId !== null} onOpenChange={handleCloseSheet}>
        <SheetContent className="overflow-y-auto overflow-x-hidden">
          {isDetailLoading ? (
            <div className="px-5 pb-6 sm:px-6">
              <ProductoDetailSkeleton />
            </div>
          ) : isDetailError ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-5 py-8 text-center sm:px-6">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div className="space-y-1">
                <p className="font-medium">No se pudo cargar el detalle</p>
                <p className="text-sm text-muted-foreground">
                  {getApiErrorMessage(
                    detailError,
                    'Ocurrio un error al consultar el producto.',
                  )}
                </p>
              </div>
              <Button size="sm" onClick={() => setSelectedId(null)}>
                Cerrar
              </Button>
            </div>
          ) : selectedProducto ? (
            <>
              <SheetHeader className="border-b border-border pb-5">
                <Badge
                  className={`${productoTypeClassName[selectedProducto.tipo] ?? 'bg-muted text-foreground border border-border'} w-fit font-medium`}
                >
                  {selectedProducto.tipo}
                </Badge>
                <SheetTitle className="text-xl">
                  {selectedProducto.nombre}
                </SheetTitle>
                <SheetDescription className="font-mono text-xs">
                  ID #{selectedProducto.id}
                </SheetDescription>
              </SheetHeader>

              <form
                onSubmit={handleSubmit}
                className="space-y-5 px-5 py-6 sm:px-6"
              >
                <div className="rounded-xl border border-border bg-gradient-to-br from-card to-muted p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Insumo relacionado
                  </p>
                  <p className="mt-1 text-xl font-semibold">
                    {selectedProducto.nombre_insumo_inventario}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Codigo: {selectedProducto.codigo}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Card className="gap-1 border-border bg-card p-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Box className="h-3 w-3" /> Costo base
                    </div>
                    <p className="text-sm font-semibold">
                      ${Number(selectedProducto.costo_base).toFixed(2)}
                    </p>
                  </Card>
                  <Card className="gap-1 border-border bg-card p-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" /> Fecha de registro
                    </div>
                    <p className="text-sm font-semibold">
                      {formatDateTime(selectedProducto.created_at)}
                    </p>
                  </Card>
                </div>

                <Card className="gap-4 border-border bg-card p-4">
                  <div>
                    <h4 className="text-sm font-semibold">
                      {isReadOnlyRole
                        ? 'Detalle del producto'
                        : 'Editar producto'}
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {isReadOnlyRole
                        ? 'Consulta los datos del producto y su relacion con inventario.'
                        : 'Puedes actualizar los datos y cambiar el inventario relacionado.'}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="producto-nombre">Nombre</Label>
                    <Input
                      id="producto-nombre"
                      value={selectedFormValues.nombre}
                      onChange={handleInputChange('nombre')}
                      aria-invalid={!!formErrors.nombre}
                      disabled={
                        isReadOnlyRole ||
                        updateProducto.isPending ||
                        deleteProducto.isPending
                      }
                    />
                    {formErrors.nombre ? (
                      <p className="text-xs text-destructive">
                        {formErrors.nombre}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="producto-tipo">Tipo</Label>
                    <select
                      id="producto-tipo"
                      value={selectedFormValues.tipo}
                      onChange={handleInputChange('tipo')}
                      aria-invalid={!!formErrors.tipo}
                      disabled={
                        isReadOnlyRole ||
                        updateProducto.isPending ||
                        deleteProducto.isPending
                      }
                      className={nativeFieldClassName}
                    >
                      <option value="insumo">insumo</option>
                      <option value="producto">producto</option>
                      <option value="servicio">servicio</option>
                    </select>
                    {formErrors.tipo ? (
                      <p className="text-xs text-destructive">
                        {formErrors.tipo}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="producto-costo-base">Costo base</Label>
                    <Input
                      id="producto-costo-base"
                      type="number"
                      min={0}
                      step="0.01"
                      value={selectedFormValues.costo_base}
                      onChange={handleInputChange('costo_base')}
                      aria-invalid={!!formErrors.costo_base}
                      disabled={
                        isReadOnlyRole ||
                        updateProducto.isPending ||
                        deleteProducto.isPending
                      }
                    />
                    {formErrors.costo_base ? (
                      <p className="text-xs text-destructive">
                        {formErrors.costo_base}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="producto-codigo">Codigo</Label>
                    <Input
                      id="producto-codigo"
                      value={selectedFormValues.codigo}
                      onChange={handleInputChange('codigo')}
                      aria-invalid={!!formErrors.codigo}
                      disabled={
                        isReadOnlyRole ||
                        updateProducto.isPending ||
                        deleteProducto.isPending
                      }
                    />
                    {formErrors.codigo ? (
                      <p className="text-xs text-destructive">
                        {formErrors.codigo}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="producto-inventario">
                      Insumo de inventario
                    </Label>
                    <select
                      id="producto-inventario"
                      value={
                        selectedFormValues.id_insumo_inventario > 0
                          ? selectedFormValues.id_insumo_inventario
                          : ''
                      }
                      onChange={handleInputChange('id_insumo_inventario')}
                      aria-invalid={!!formErrors.id_insumo_inventario}
                      disabled={
                        isReadOnlyRole ||
                        updateProducto.isPending ||
                        deleteProducto.isPending ||
                        isLoadingInventarioOptions
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
                    {formErrors.id_insumo_inventario ? (
                      <p className="text-xs text-destructive">
                        {formErrors.id_insumo_inventario}
                      </p>
                    ) : null}
                  </div>
                </Card>

                <div className="sticky bottom-0 -mx-5 flex flex-col gap-3 border-t border-border bg-background/95 px-5 py-4 backdrop-blur sm:-mx-6 sm:px-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    {isReadOnlyRole ? null : (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        disabled={
                          updateProducto.isPending || deleteProducto.isPending
                        }
                        className="sm:self-start"
                      >
                        <Trash className="h-3.5 w-3.5" /> Eliminar
                      </Button>
                    )}

                    {isReadOnlyRole ? null : (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFormValues(getInitialFormState(selectedProducto))
                            setFormErrors({})
                          }}
                          disabled={
                            updateProducto.isPending || deleteProducto.isPending
                          }
                        >
                          <Edit3 className="h-3.5 w-3.5" /> Restablecer
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={
                            updateProducto.isPending || deleteProducto.isPending
                          }
                        >
                          {updateProducto.isPending ? (
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
                </div>
              </form>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={isReadOnlyRole ? false : isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedProducto
                ? `Se eliminara "${selectedProducto.nombre}". Esta accion no se puede deshacer.`
                : 'Esta accion no se puede deshacer.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProducto.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                void handleDelete()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteProducto.isPending}
            >
              {deleteProducto.isPending ? (
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
