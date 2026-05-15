import { useState, type ChangeEvent, type FormEvent } from 'react'
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Loader2,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Search,
  Trash,
  Users,
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
import { AdminTopBar } from '../components/AdminTopBar'
import { useClienteById } from '../hooks/useClienteById'
import { useClientes } from '../hooks/useClientes'
import { useCreateCliente } from '../hooks/useCreateCliente'
import { useDeleteCliente } from '../hooks/useDeleteCliente'
import { useUpdateCliente } from '../hooks/useUpdateCliente'
import type {
  ClienteItem,
  CreateClientePayload,
  UpdateClientePayload,
} from '../types/clientes'

type ClientePageSize = 9 | 18 | 27

interface ClienteFormValues {
  nombre_comercial: string
  nombre_contacto: string
  telefono: string
  email: string
  direccion: string
}

interface ClienteFormErrors {
  nombre_comercial?: string
  nombre_contacto?: string
  telefono?: string
  email?: string
  direccion?: string
}

const statusColor =
  'bg-success/10 text-success border border-success/20 font-medium'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const getClienteDisplayName = (cliente: ClienteItem) =>
  cliente.nombre_comercial?.trim() || cliente.nombre_contacto

const getClienteInitials = (cliente: ClienteItem) =>
  getClienteDisplayName(cliente)
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

const getInitialCreateFormState = (): ClienteFormValues => ({
  nombre_comercial: '',
  nombre_contacto: '',
  telefono: '',
  email: '',
  direccion: '',
})

const getInitialFormState = (
  cliente: ClienteItem | null,
): ClienteFormValues => ({
  nombre_comercial: cliente?.nombre_comercial ?? '',
  nombre_contacto: cliente?.nombre_contacto ?? '',
  telefono: cliente?.telefono ?? '',
  email: cliente?.email ?? '',
  direccion: cliente?.direccion ?? '',
})

const validateClienteForm = (values: ClienteFormValues) => {
  const errors: ClienteFormErrors = {}

  if (values.nombre_comercial.trim().length > 100) {
    errors.nombre_comercial =
      'El nombre comercial no debe exceder los 100 caracteres.'
  }

  if (!values.nombre_contacto.trim()) {
    errors.nombre_contacto = 'El nombre de contacto es requerido.'
  } else if (values.nombre_contacto.trim().length > 100) {
    errors.nombre_contacto =
      'El nombre de contacto no debe exceder los 100 caracteres.'
  }

  if (!values.telefono.trim()) {
    errors.telefono = 'El teléfono es requerido.'
  } else if (values.telefono.trim().length > 20) {
    errors.telefono = 'El teléfono no debe exceder los 20 caracteres.'
  }

  if (values.email.trim()) {
    if (values.email.trim().length > 150) {
      errors.email = 'El email no debe exceder los 150 caracteres.'
    } else if (!emailRegex.test(values.email.trim())) {
      errors.email = 'El email debe tener un formato válido.'
    }
  }

  if (!values.direccion.trim()) {
    errors.direccion = 'La dirección es requerida.'
  } else if (values.direccion.trim().length > 150) {
    errors.direccion = 'La dirección no debe exceder los 150 caracteres.'
  }

  return errors
}

const buildCreateClientePayload = (
  values: ClienteFormValues,
): CreateClientePayload => {
  const nombreComercial = values.nombre_comercial.trim()
  const email = values.email.trim()

  return {
    nombre_comercial: nombreComercial || null,
    nombre_contacto: values.nombre_contacto.trim(),
    telefono: values.telefono.trim(),
    email: email || null,
    direccion: values.direccion.trim(),
  }
}

const buildUpdateClientePayload = (
  values: ClienteFormValues,
): UpdateClientePayload => {
  const nombreComercial = values.nombre_comercial.trim()
  const email = values.email.trim()

  return {
    nombre_comercial: nombreComercial || null,
    nombre_contacto: values.nombre_contacto.trim(),
    telefono: values.telefono.trim(),
    email: email || null,
    direccion: values.direccion.trim(),
  }
}

const ClientesGridSkeleton = () => (
  <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="space-y-4 bg-card p-5">
        <div className="flex items-start gap-3">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      </div>
    ))}
  </div>
)

const ClienteDetailSkeleton = () => (
  <div className="space-y-5 px-5 py-6 sm:px-6">
    <Skeleton className="h-28 w-full rounded-xl" />
    <div className="grid gap-3 sm:grid-cols-2">
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
    <Skeleton className="h-80 w-full rounded-xl" />
  </div>
)

export const ClientesPage = () => {
  const user = useAuthStore((state) => state.user)
  const isReadOnlyRole =
    user?.rol === 'PRODUCCION' || user?.rol === 'RECEPCION'
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<ClientePageSize>(9)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const [createFormValues, setCreateFormValues] = useState<ClienteFormValues>(
    getInitialCreateFormState,
  )
  const [createFormErrors, setCreateFormErrors] = useState<ClienteFormErrors>(
    {},
  )

  const [formValues, setFormValues] = useState<ClienteFormValues | null>(null)
  const [formErrors, setFormErrors] = useState<ClienteFormErrors>({})

  const normalizedSearchTerm = searchTerm.trim()

  const { data, error, isError, isFetching, isLoading, refetch } = useClientes({
    page,
    limit: pageSize,
    search: normalizedSearchTerm,
  })

  const {
    data: selectedCliente,
    error: detailError,
    isError: isDetailError,
    isLoading: isDetailLoading,
  } = useClienteById({ id: selectedId })

  const createCliente = useCreateCliente()
  const updateCliente = useUpdateCliente()
  const deleteCliente = useDeleteCliente()

  const clientes = data?.items ?? []
  const pagination = data?.pagination
  const totalPages = pagination?.totalPages ?? 1
  const currentPage = pagination?.page ?? page
  const hasPagination = totalPages > 1
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  )

  const selectedFormValues =
    formValues ?? getInitialFormState(selectedCliente ?? null)

  const handleCloseCreateSheet = (open: boolean) => {
    setIsCreateSheetOpen(open)

    if (!open) {
      setCreateFormValues(getInitialCreateFormState())
      setCreateFormErrors({})
    }
  }

  const handleCloseDetailSheet = (open: boolean) => {
    if (open) return

    setSelectedId(null)
    setIsDeleteDialogOpen(false)
    setFormValues(null)
    setFormErrors({})
  }

  const handleCreateInputChange =
    (field: keyof ClienteFormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setCreateFormValues((current) => ({
        ...current,
        [field]: event.target.value,
      }))

      setCreateFormErrors((current) => ({
        ...current,
        [field]: undefined,
      }))
    }

  const handleInputChange =
    (field: keyof ClienteFormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormValues((current) => ({
        ...(current ?? getInitialFormState(selectedCliente ?? null)),
        [field]: event.target.value,
      }))

      setFormErrors((current) => ({
        ...current,
        [field]: undefined,
      }))
    }

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isReadOnlyRole) return

    const validationErrors = validateClienteForm(createFormValues)

    if (Object.keys(validationErrors).length > 0) {
      setCreateFormErrors(validationErrors)
      return
    }

    try {
      await createCliente.mutateAsync(
        buildCreateClientePayload(createFormValues),
      )

      setIsCreateSheetOpen(false)
      setCreateFormValues(getInitialCreateFormState())
      setCreateFormErrors({})

      toast.success('Cliente creado', {
        description: 'El cliente se registró correctamente.',
      })
    } catch (mutationError) {
      toast.error('No se pudo crear el cliente', {
        description: getApiErrorMessage(
          mutationError,
          'Revisa los datos e intenta nuevamente.',
        ),
      })
    }
  }

  const handleUpdateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isReadOnlyRole) return

    if (!selectedId || !selectedCliente) return

    const validationErrors = validateClienteForm(selectedFormValues)

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors)
      return
    }

    try {
      await updateCliente.mutateAsync({
        id: selectedId,
        payload: buildUpdateClientePayload(selectedFormValues),
      })

      setFormValues(null)
      setFormErrors({})

      toast.success('Cliente actualizado', {
        description: 'Los cambios se guardaron correctamente.',
      })
    } catch (mutationError) {
      toast.error('No se pudo actualizar el cliente', {
        description: getApiErrorMessage(
          mutationError,
          'Revisa los datos e intenta nuevamente.',
        ),
      })
    }
  }

  const handleDelete = async () => {
    if (isReadOnlyRole) return
    if (!selectedId || !selectedCliente) return

    try {
      await deleteCliente.mutateAsync(selectedId)

      setIsDeleteDialogOpen(false)
      setSelectedId(null)
      setFormValues(null)
      setFormErrors({})

      toast.success('Cliente eliminado', {
        description: 'El cliente se eliminó correctamente.',
      })
    } catch (mutationError) {
      toast.error('No se pudo eliminar el cliente', {
        description: getApiErrorMessage(
          mutationError,
          'No se puede eliminar un cliente con pedidos asociados.',
        ),
      })
    }
  }

  return (
    <>
      <AdminTopBar
        title="Clientes"
        breadcrumbs={[{ label: 'Clientes' }]}
        primaryAction={
          isReadOnlyRole
            ? undefined
            : {
                label: 'Nuevo cliente',
                onClick: () => setIsCreateSheetOpen(true),
              }
        }
      />

      <div className="space-y-5 p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="gap-1 border-border bg-card p-5 shadow-soft">
            <p className="text-xs text-muted-foreground">Total clientes</p>
            <p className="text-2xl font-semibold">
              {pagination?.total ?? '--'}
            </p>
          </Card>

          <Card className="gap-1 border-border bg-card p-5 shadow-soft">
            <p className="text-xs text-muted-foreground">
              Visibles en esta página
            </p>
            <p className="text-2xl font-semibold">{clientes.length}</p>
          </Card>

          <Card className="gap-1 border-border bg-card p-5 shadow-soft">
            <p className="text-xs text-muted-foreground">Con email visible</p>
            <p className="text-2xl font-semibold">
              {clientes.filter((cliente) => cliente.email).length}
            </p>
          </Card>
        </div>

        <Card className="gap-0 overflow-hidden border-border bg-card p-0 shadow-soft">
          <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => {
                  setPage(1)
                  setSearchTerm(event.target.value)
                }}
                placeholder="Buscar cliente, contacto, teléfono..."
                className="h-8 bg-muted pl-8 text-xs"
              />
            </div>

            {normalizedSearchTerm ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPage(1)
                  setSearchTerm('')
                }}
              >
                Limpiar búsqueda
              </Button>
            ) : null}
          </div>

          {isLoading ? (
            <ClientesGridSkeleton />
          ) : isError ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div className="space-y-1">
                <p className="font-medium">No se pudieron cargar clientes</p>
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
          ) : clientes.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-2 p-6 text-center">
              <Users className="h-8 w-8 text-muted-foreground" />
              <p className="font-medium">
                {normalizedSearchTerm
                  ? 'No hay resultados para esa búsqueda'
                  : 'No hay clientes registrados'}
              </p>
              <p className="text-sm text-muted-foreground">
                {normalizedSearchTerm
                  ? 'Prueba buscando por otro nombre, teléfono o dirección.'
                  : 'Cuando registres clientes, aparecerán aquí.'}
              </p>
            </div>
          ) : (
            <div className="relative">
              {isFetching ? (
                <div className="absolute inset-x-0 top-0 h-0.5 bg-border">
                  <div className="h-full w-full animate-pulse bg-primary/70" />
                </div>
              ) : null}

              <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-3">
                {clientes.map((cliente) => (
                  <button
                    key={cliente.id}
                    type="button"
                    onClick={() => setSelectedId(cliente.id)}
                    className="bg-card p-5 text-left transition hover:bg-surface"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand/60 text-sm font-semibold text-brand-foreground">
                          {getClienteInitials(cliente)}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {getClienteDisplayName(cliente)}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {cliente.nombre_contacto}
                          </p>
                        </div>
                      </div>

                      <Badge className={statusColor}>Activo</Badge>
                    </div>

                    <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {cliente.email ?? 'Sin email'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span className="truncate">{cliente.telefono}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{cliente.direccion}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <div>
                        <p className="text-[11px] text-muted-foreground">
                          Registro de cliente
                        </p>
                        <p className="text-sm font-semibold">
                          ID #{cliente.id}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={(event) => {
                          event.stopPropagation()
                          setSelectedId(cliente.id)
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {pagination && clientes.length > 0 ? (
            <div className="flex flex-col gap-3 border-t border-border px-5 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>
                Página {currentPage} de {totalPages}
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <span>Mostrar</span>

                {[9, 18, 27].map((size) => (
                  <Button
                    key={size}
                    variant={pageSize === size ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setPage(1)
                      setPageSize(size as ClientePageSize)
                    }}
                    disabled={isFetching}
                  >
                    {size}
                  </Button>
                ))}

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
            <SheetTitle className="text-xl">Nuevo cliente</SheetTitle>
            <SheetDescription>
              Registra los datos comerciales y de contacto del cliente.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleCreateSubmit}
            className="space-y-5 px-5 py-6 sm:px-6"
          >
            <Card className="gap-4 border-border bg-card p-4">
              <div>
                <h4 className="text-sm font-semibold">
                  Información del cliente
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Los campos de contacto, teléfono y dirección son obligatorios.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-nombre-comercial">
                  Nombre comercial
                </Label>
                <Input
                  id="create-nombre-comercial"
                  value={createFormValues.nombre_comercial}
                  onChange={handleCreateInputChange('nombre_comercial')}
                  placeholder="Opcional"
                  disabled={createCliente.isPending}
                />
                {createFormErrors.nombre_comercial ? (
                  <p className="text-xs text-destructive">
                    {createFormErrors.nombre_comercial}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-nombre-contacto">
                  Nombre de contacto
                </Label>
                <Input
                  id="create-nombre-contacto"
                  value={createFormValues.nombre_contacto}
                  onChange={handleCreateInputChange('nombre_contacto')}
                  disabled={createCliente.isPending}
                />
                {createFormErrors.nombre_contacto ? (
                  <p className="text-xs text-destructive">
                    {createFormErrors.nombre_contacto}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-telefono">Teléfono</Label>
                <Input
                  id="create-telefono"
                  value={createFormValues.telefono}
                  onChange={handleCreateInputChange('telefono')}
                  disabled={createCliente.isPending}
                />
                {createFormErrors.telefono ? (
                  <p className="text-xs text-destructive">
                    {createFormErrors.telefono}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-email">Email</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={createFormValues.email}
                  onChange={handleCreateInputChange('email')}
                  placeholder="Opcional"
                  disabled={createCliente.isPending}
                />
                {createFormErrors.email ? (
                  <p className="text-xs text-destructive">
                    {createFormErrors.email}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-direccion">Dirección</Label>
                <Input
                  id="create-direccion"
                  value={createFormValues.direccion}
                  onChange={handleCreateInputChange('direccion')}
                  disabled={createCliente.isPending}
                />
                {createFormErrors.direccion ? (
                  <p className="text-xs text-destructive">
                    {createFormErrors.direccion}
                  </p>
                ) : null}
              </div>
            </Card>

            <div className="sticky bottom-0 -mx-5 flex justify-end gap-2 border-t border-border bg-background/95 px-5 py-4 backdrop-blur sm:-mx-6 sm:px-6">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setCreateFormValues(getInitialCreateFormState())
                  setCreateFormErrors({})
                }}
                disabled={createCliente.isPending}
              >
                Restablecer
              </Button>

              <Button
                type="submit"
                size="sm"
                disabled={createCliente.isPending}
              >
                {createCliente.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Crear cliente'
                )}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={selectedId !== null} onOpenChange={handleCloseDetailSheet}>
        <SheetContent className="overflow-y-auto overflow-x-hidden">
          {isDetailLoading ? (
            <ClienteDetailSkeleton />
          ) : isDetailError ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-5 py-8 text-center sm:px-6">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div className="space-y-1">
                <p className="font-medium">No se pudo cargar el cliente</p>
                <p className="text-sm text-muted-foreground">
                  {getApiErrorMessage(
                    detailError,
                    'Ocurrió un error al consultar el detalle.',
                  )}
                </p>
              </div>
              <Button size="sm" onClick={() => setSelectedId(null)}>
                Cerrar
              </Button>
            </div>
          ) : selectedCliente ? (
            <>
              <SheetHeader className="border-b border-border pb-5">
                <Badge className={`${statusColor} w-fit`}>Activo</Badge>
                <SheetTitle className="text-xl">
                  {getClienteDisplayName(selectedCliente)}
                </SheetTitle>
                <SheetDescription>
                  Contacto: {selectedCliente.nombre_contacto}
                </SheetDescription>
              </SheetHeader>

              <form
                onSubmit={handleUpdateSubmit}
                className="space-y-5 px-5 py-6 sm:px-6"
              >
                <div className="rounded-xl border border-border bg-gradient-to-br from-card to-muted p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Cliente
                  </p>
                  <p className="mt-1 text-3xl font-semibold">
                    {getClienteDisplayName(selectedCliente)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    ID #{selectedCliente.id}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Card className="gap-1 border-border bg-card p-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" /> Teléfono
                    </div>
                    <p className="text-sm font-semibold">
                      {selectedCliente.telefono}
                    </p>
                  </Card>

                  <Card className="gap-1 border-border bg-card p-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" /> Email
                    </div>
                    <p className="truncate text-sm font-semibold">
                      {selectedCliente.email ?? 'Sin email'}
                    </p>
                  </Card>

                  <Card className="gap-1 border-border bg-card p-4 sm:col-span-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> Dirección
                    </div>
                    <p className="text-sm font-semibold">
                      {selectedCliente.direccion}
                    </p>
                  </Card>
                </div>

                <Card className="gap-4 border-border bg-card p-4">
                  <div>
                    <h4 className="text-sm font-semibold">Editar cliente</h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Puedes actualizar la información comercial y de contacto.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-nombre-comercial">
                      Nombre comercial
                    </Label>
                    <Input
                      id="edit-nombre-comercial"
                      value={selectedFormValues.nombre_comercial}
                      onChange={handleInputChange('nombre_comercial')}
                      placeholder="Opcional"
                      disabled={
                        isReadOnlyRole ||
                        updateCliente.isPending ||
                        deleteCliente.isPending
                      }
                    />
                    {formErrors.nombre_comercial ? (
                      <p className="text-xs text-destructive">
                        {formErrors.nombre_comercial}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-nombre-contacto">
                      Nombre de contacto
                    </Label>
                    <Input
                      id="edit-nombre-contacto"
                      value={selectedFormValues.nombre_contacto}
                      onChange={handleInputChange('nombre_contacto')}
                      disabled={
                        isReadOnlyRole ||
                        updateCliente.isPending ||
                        deleteCliente.isPending
                      }
                    />
                    {formErrors.nombre_contacto ? (
                      <p className="text-xs text-destructive">
                        {formErrors.nombre_contacto}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-telefono">Teléfono</Label>
                    <Input
                      id="edit-telefono"
                      value={selectedFormValues.telefono}
                      onChange={handleInputChange('telefono')}
                      disabled={
                        isReadOnlyRole ||
                        updateCliente.isPending ||
                        deleteCliente.isPending
                      }
                    />
                    {formErrors.telefono ? (
                      <p className="text-xs text-destructive">
                        {formErrors.telefono}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={selectedFormValues.email}
                      onChange={handleInputChange('email')}
                      placeholder="Opcional"
                      disabled={
                        isReadOnlyRole ||
                        updateCliente.isPending ||
                        deleteCliente.isPending
                      }
                    />
                    {formErrors.email ? (
                      <p className="text-xs text-destructive">
                        {formErrors.email}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-direccion">Dirección</Label>
                    <Input
                      id="edit-direccion"
                      value={selectedFormValues.direccion}
                      onChange={handleInputChange('direccion')}
                      disabled={
                        isReadOnlyRole ||
                        updateCliente.isPending ||
                        deleteCliente.isPending
                      }
                    />
                    {formErrors.direccion ? (
                      <p className="text-xs text-destructive">
                        {formErrors.direccion}
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
                          updateCliente.isPending || deleteCliente.isPending
                        }
                      >
                        <Trash className="h-3.5 w-3.5" />
                        Eliminar
                      </Button>
                    )}

                    {isReadOnlyRole ? null : (
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
                            updateCliente.isPending || deleteCliente.isPending
                          }
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Restablecer
                        </Button>

                        <Button
                          type="submit"
                          size="sm"
                          disabled={
                            updateCliente.isPending || deleteCliente.isPending
                          }
                        >
                          {updateCliente.isPending ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            <>
                              <Edit3 className="h-3.5 w-3.5" />
                              Guardar cambios
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
            <AlertDialogTitle>Eliminar cliente</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCliente
                ? `Se eliminará "${getClienteDisplayName(
                    selectedCliente,
                  )}". Esta acción no se puede deshacer.`
                : 'Esta acción no se puede deshacer.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCliente.isPending}>
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                void handleDelete()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteCliente.isPending}
            >
              {deleteCliente.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Eliminando...
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

export default ClientesPage
