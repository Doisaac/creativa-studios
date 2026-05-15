import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import {
  AlertTriangle,
  Ban,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Filter,
  Loader2,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Trash2,
  Truck,
  User,
  X,
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
import { useAuthStore } from '@/auth/store/authStore'
import { getApiErrorMessage } from '@/lib/get-api-error-message'
import { AdminTopBar } from '../components/AdminTopBar'
import { useClientes } from '../hooks/useClientes'
import { useCreatePedido } from '../hooks/useCreatePedido'
import { usePedidoById } from '../hooks/usePedidoById'
import { usePedidos } from '../hooks/usePedidos'
import { usePrecios } from '../hooks/usePrecios'
import { useUpdatePedido } from '../hooks/useUpdatePedido'
import { useUpdatePedidoEstado } from '../hooks/useUpdatePedidoEstado'
import type { ClienteItem } from '../types/clientes'
import type {
  CreatePedidoPayload,
  PedidoEstado,
  PedidoListItem,
  UpdatePedidoPayload,
} from '../types/pedidos'
import type { PrecioItem } from '../types/precios'

type PedidoEstadoFilter = 'todos' | PedidoEstado
type PedidoView = 'tabla' | 'kanban'
type PedidoFormMode = 'create' | 'edit'

interface CreatePedidoDetalleFormValues {
  id_producto: string
  cantidad: string
}

interface CreatePedidoFormValues {
  id_cliente: string
  fecha_entrega: string
  detalles: CreatePedidoDetalleFormValues[]
}

interface CreatePedidoDetalleFormErrors {
  id_producto?: string
  cantidad?: string
}

interface CreatePedidoFormErrors {
  id_cliente?: string
  fecha_entrega?: string
  detalles?: string
  detalleErrors?: CreatePedidoDetalleFormErrors[]
}

const PAGE_SIZE = 10
const PICKER_LIMIT = 8

const ESTADO_TABS: Array<{ key: PedidoEstadoFilter; label: string }> = [
  { key: 'todos', label: 'Todos' },
  { key: 'pendiente', label: 'Pendiente' },
  { key: 'produccion', label: 'En producción' },
  { key: 'finalizado', label: 'Finalizado' },
  { key: 'entregado', label: 'Entregado' },
  { key: 'cancelado', label: 'Cancelado' },
]

const ESTADO_LABELS: Record<PedidoEstado, string> = {
  pendiente: 'Pendiente',
  produccion: 'En producción',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
  entregado: 'Entregado',
}

const ESTADO_STYLES: Record<PedidoEstado, string> = {
  pendiente: 'bg-muted text-foreground border border-border',
  produccion: 'bg-info/10 text-info border border-info/20',
  finalizado: 'bg-success/10 text-success border border-success/20',
  cancelado: 'bg-destructive/10 text-destructive border border-destructive/20',
  entregado: 'bg-brand-muted text-accent-foreground border border-brand/20',
}

const ESTADO_ICONS: Record<PedidoEstado, typeof Clock> = {
  pendiente: Clock,
  produccion: Truck,
  finalizado: CheckCircle2,
  cancelado: Ban,
  entregado: CheckCircle2,
}

const TRANSICIONES_PERMITIDAS: Record<PedidoEstado, PedidoEstado[]> = {
  pendiente: ['produccion', 'cancelado'],
  produccion: ['finalizado', 'cancelado'],
  finalizado: ['entregado'],
  cancelado: [],
  entregado: [],
}

const currencyFormatter = new Intl.NumberFormat('es-SV', {
  style: 'currency',
  currency: 'USD',
})

const dateFormatter = new Intl.DateTimeFormat('es-SV', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const getInitialCreatePedidoFormState = (): CreatePedidoFormValues => ({
  id_cliente: '',
  fecha_entrega: '',
  detalles: [
    {
      id_producto: '',
      cantidad: '1',
    },
  ],
})

const getPedidoCode = (id: number) => `PED-${String(id).padStart(4, '0')}`

const formatCurrency = (value: number) => currencyFormatter.format(value)

const formatDate = (value: string | null) => {
  if (!value) return 'Sin fecha'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Fecha inválida'

  return dateFormatter.format(date)
}

const getClienteDisplayName = (cliente: ClienteItem) =>
  cliente.nombre_comercial?.trim() || cliente.nombre_contacto

const getClientePickerLabel = (cliente: ClienteItem) => {
  const displayName = getClienteDisplayName(cliente)
  const contactName = cliente.nombre_contacto
  const phone = cliente.telefono

  return `${displayName} — ${contactName}${phone ? ` · ${phone}` : ''}`
}

const getClienteSearchText = (cliente: ClienteItem) =>
  [
    cliente.nombre_comercial,
    cliente.nombre_contacto,
    cliente.telefono,
    cliente.email,
    cliente.direccion,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

const getPrecioPickerLabel = (precio: PrecioItem) =>
  `${precio.nombre_producto} — ${formatCurrency(precio.precio_sugerido)}`

const getPrecioSearchText = (precio: PrecioItem) =>
  [
    precio.id_producto,
    precio.nombre_producto,
    precio.precio_sugerido,
    precio.margen_ganancia,
  ]
    .join(' ')
    .toLowerCase()

const getPedidoSearchText = (pedido: PedidoListItem) =>
  [
    getPedidoCode(pedido.id),
    pedido.cliente_nombre,
    pedido.cliente_nombre_comercial,
    pedido.cliente_nombre_contacto,
    pedido.producto_resumen,
    pedido.usuario_nombre,
    pedido.estado,
  ]
    .join(' ')
    .toLowerCase()

const validateCreatePedidoForm = (
  values: CreatePedidoFormValues,
): CreatePedidoFormErrors => {
  const errors: CreatePedidoFormErrors = {}
  const detalleErrors: CreatePedidoDetalleFormErrors[] = []
  const productosSeleccionados = new Set<number>()

  const parsedClienteId = Number(values.id_cliente)

  if (!Number.isInteger(parsedClienteId) || parsedClienteId <= 0) {
    errors.id_cliente = 'Selecciona un cliente.'
  }

  if (values.fecha_entrega.trim()) {
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(values.fecha_entrega.trim())

    if (!isValidDate) {
      errors.fecha_entrega = 'La fecha debe tener formato YYYY-MM-DD.'
    }
  }

  if (values.detalles.length === 0) {
    errors.detalles = 'Agrega al menos un producto al pedido.'
  }

  values.detalles.forEach((detalle, index) => {
    const currentErrors: CreatePedidoDetalleFormErrors = {}
    const parsedProductoId = Number(detalle.id_producto)
    const parsedCantidad = Number(detalle.cantidad)

    if (!Number.isInteger(parsedProductoId) || parsedProductoId <= 0) {
      currentErrors.id_producto = 'Selecciona un producto.'
    } else if (productosSeleccionados.has(parsedProductoId)) {
      currentErrors.id_producto = 'Este producto ya está agregado.'
    } else {
      productosSeleccionados.add(parsedProductoId)
    }

    if (!Number.isInteger(parsedCantidad) || parsedCantidad <= 0) {
      currentErrors.cantidad = 'La cantidad debe ser mayor a 0.'
    }

    detalleErrors[index] = currentErrors
  })

  if (
    detalleErrors.some(
      (detalleError) => detalleError.id_producto || detalleError.cantidad,
    )
  ) {
    errors.detalleErrors = detalleErrors
  }

  return errors
}

const hasCreatePedidoFormErrors = (errors: CreatePedidoFormErrors) =>
  Boolean(
    errors.id_cliente ||
    errors.fecha_entrega ||
    errors.detalles ||
    errors.detalleErrors?.some(
      (detalleError) => detalleError.id_producto || detalleError.cantidad,
    ),
  )

const buildPedidoPayload = (
  values: CreatePedidoFormValues,
): CreatePedidoPayload | UpdatePedidoPayload => {
  const payload: CreatePedidoPayload = {
    id_cliente: Number(values.id_cliente),
    detalles: values.detalles.map((detalle) => ({
      id_producto: Number(detalle.id_producto),
      cantidad: Number(detalle.cantidad),
    })),
  }

  const fechaEntrega = values.fecha_entrega.trim()

  if (fechaEntrega) {
    payload.fecha_entrega = fechaEntrega
  }

  return payload
}

const PedidosTableSkeleton = () => (
  <div className="divide-y divide-border">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={index}
        className="grid grid-cols-[1fr_1.5fr_2fr_1fr_1fr_1fr] gap-4 px-5 py-4"
      >
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-14" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="ml-auto h-4 w-20" />
      </div>
    ))}
  </div>
)

const PedidoDetailSkeleton = () => (
  <div className="space-y-5 px-5 py-6 sm:px-6">
    <Skeleton className="h-24 w-full rounded-xl" />
    <div className="grid gap-3 sm:grid-cols-2">
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
    </div>
    <Skeleton className="h-52 w-full rounded-xl" />
    <Skeleton className="h-28 w-full rounded-xl" />
  </div>
)

export const PedidosPage = () => {
  const user = useAuthStore((state) => state.user)
  const isProduccion = user?.rol === 'PRODUCCION'
  const isInstalador = user?.rol === 'INSTALADOR'
  const canCreatePedido = !isProduccion && !isInstalador
  const [page, setPage] = useState(1)
  const [view, setView] = useState<PedidoView>('tabla')
  const [estadoFilter, setEstadoFilter] = useState<PedidoEstadoFilter>('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPedidoId, setSelectedPedidoId] = useState<number | null>(null)

  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)
  const [pedidoFormMode, setPedidoFormMode] = useState<PedidoFormMode>('create')
  const [editingPedidoId, setEditingPedidoId] = useState<number | null>(null)

  const [isClientePickerOpen, setIsClientePickerOpen] = useState(false)
  const [activeProductoPickerIndex, setActiveProductoPickerIndex] = useState<
    number | null
  >(null)

  const [clienteSearch, setClienteSearch] = useState('')
  const [productoSearchTerms, setProductoSearchTerms] = useState<
    Record<number, string>
  >({})

  const [createFormValues, setCreateFormValues] =
    useState<CreatePedidoFormValues>(getInitialCreatePedidoFormState)
  const [createFormErrors, setCreateFormErrors] =
    useState<CreatePedidoFormErrors>({})

  const selectedEstado = estadoFilter === 'todos' ? undefined : estadoFilter

  const {
    data,
    error,
    isError,
    isFetching,
    isLoading,
    refetch: refetchPedidos,
  } = usePedidos({
    page,
    limit: PAGE_SIZE,
    estado: selectedEstado,
  })

  const {
    data: clientesData,
    isLoading: isClientesLoading,
    refetch: refetchClientes,
  } = useClientes({
    page: 1,
    limit: 100,
    search: '',
  })

  const {
    data: preciosData,
    isLoading: isPreciosLoading,
    refetch: refetchPrecios,
  } = usePrecios({
    page: 1,
    limit: 100,
  })

  const {
    data: selectedPedido,
    error: detailError,
    isError: isDetailError,
    isLoading: isDetailLoading,
  } = usePedidoById({ id: selectedPedidoId })

  const createPedido = useCreatePedido()
  const updatePedido = useUpdatePedido()
  const updatePedidoEstado = useUpdatePedidoEstado()

  const pedidos = data?.items ?? []
  const pagination = data?.pagination
  const totalPages = pagination?.totalPages ?? 1
  const currentPage = pagination?.page ?? page
  const totalPedidos = pagination?.total ?? 0
  const clientes = useMemo(() => clientesData?.items ?? [], [clientesData])
  const precios = preciosData?.items ?? []
  const isSavingPedido = createPedido.isPending || updatePedido.isPending

  const normalizedSearchTerm = searchTerm.trim().toLowerCase()

  const filteredPedidos = normalizedSearchTerm
    ? pedidos.filter((pedido) =>
        getPedidoSearchText(pedido).includes(normalizedSearchTerm),
      )
    : pedidos

  const filteredClientes = useMemo(() => {
    const normalizedClienteSearch = clienteSearch.trim().toLowerCase()

    if (!normalizedClienteSearch) {
      return clientes.slice(0, PICKER_LIMIT)
    }

    return clientes
      .filter((cliente) =>
        getClienteSearchText(cliente).includes(normalizedClienteSearch),
      )
      .slice(0, PICKER_LIMIT)
  }, [clientes, clienteSearch])

  const selectedCliente = clientes.find(
    (cliente) => cliente.id === Number(createFormValues.id_cliente),
  )

  const selectedTransitions = selectedPedido
    ? TRANSICIONES_PERMITIDAS[selectedPedido.estado]
    : []

  const estimatedTotal = createFormValues.detalles.reduce((total, detalle) => {
    const precio = precios.find(
      (precioItem) => precioItem.id_producto === Number(detalle.id_producto),
    )

    const cantidad = Number(detalle.cantidad)

    if (!precio || !Number.isFinite(cantidad) || cantidad <= 0) {
      return total
    }

    return total + precio.precio_sugerido * cantidad
  }, 0)

  const getEstadoCount = (estado: PedidoEstadoFilter) => {
    if (estado === 'todos') return totalPedidos

    return pedidos.filter((pedido) => pedido.estado === estado).length
  }

  const getPrecioByProductoId = (idProducto: string | number) =>
    precios.find((precio) => precio.id_producto === Number(idProducto))

  const getFilteredPrecios = (index: number) => {
    const search = productoSearchTerms[index]?.trim().toLowerCase() ?? ''

    if (!search) {
      return precios.slice(0, PICKER_LIMIT)
    }

    return precios
      .filter((precio) => getPrecioSearchText(precio).includes(search))
      .slice(0, PICKER_LIMIT)
  }

  const resetCreateForm = () => {
    setPedidoFormMode('create')
    setEditingPedidoId(null)
    setCreateFormValues(getInitialCreatePedidoFormState())
    setCreateFormErrors({})
    setClienteSearch('')
    setProductoSearchTerms({})
    setIsClientePickerOpen(false)
    setActiveProductoPickerIndex(null)
  }

  const handleOpenCreatePedidoSheet = () => {
    if (!canCreatePedido) return
    resetCreateForm()
    setPedidoFormMode('create')
    setEditingPedidoId(null)
    setIsCreateSheetOpen(true)
    void Promise.all([refetchClientes(), refetchPrecios()])
  }

  const handleCreateSheetOpenChange = (open: boolean) => {
    if (open && pedidoFormMode === 'create' && !canCreatePedido) return

    setIsCreateSheetOpen(open)

    if (open) {
      void Promise.all([refetchClientes(), refetchPrecios()])
      return
    }

    resetCreateForm()
  }

  const handleOpenEditPedidoSheet = () => {
    if (!selectedPedido || selectedPedido.estado !== 'pendiente') {
      return
    }

    setPedidoFormMode('edit')
    setEditingPedidoId(selectedPedido.id)

    setCreateFormValues({
      id_cliente: String(selectedPedido.id_cliente),
      fecha_entrega: selectedPedido.fecha_entrega
        ? selectedPedido.fecha_entrega.slice(0, 10)
        : '',
      detalles: selectedPedido.detalles.map((detalle) => ({
        id_producto: String(detalle.id_producto),
        cantidad: String(detalle.cantidad),
      })),
    })

    const clienteDisplayName =
      selectedPedido.cliente_nombre_comercial?.trim() ||
      selectedPedido.cliente_nombre_contacto

    setClienteSearch(
      `${selectedPedido.cliente_nombre_comercial} — ${
        selectedPedido.cliente_nombre_contacto
      }${
        selectedPedido.cliente_telefono
          ? ` · ${selectedPedido.cliente_telefono}`
          : ''
      }`,
    )

    setClienteSearch(
      `${clienteDisplayName} — ${selectedPedido.cliente_nombre_contacto}${
        selectedPedido.cliente_telefono
          ? ` · ${selectedPedido.cliente_telefono}`
          : ''
      }`,
    )

    setProductoSearchTerms(
      Object.fromEntries(
        selectedPedido.detalles.map((detalle, index) => [
          index,
          `${detalle.producto_nombre} — ${formatCurrency(
            detalle.precio_unitario,
          )}`,
        ]),
      ),
    )

    setCreateFormErrors({})
    setIsClientePickerOpen(false)
    setActiveProductoPickerIndex(null)
    setSelectedPedidoId(null)
    setIsCreateSheetOpen(true)

    void Promise.all([refetchClientes(), refetchPrecios()])
  }

  const handleEstadoFilterChange = (estado: PedidoEstadoFilter) => {
    setEstadoFilter(estado)
    setPage(1)
  }

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleClienteSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setClienteSearch(event.target.value)
    setIsClientePickerOpen(true)

    setCreateFormValues((current) => ({
      ...current,
      id_cliente: '',
    }))
  }

  const handleSelectCliente = (cliente: ClienteItem) => {
    setCreateFormValues((current) => ({
      ...current,
      id_cliente: String(cliente.id),
    }))

    setClienteSearch(getClientePickerLabel(cliente))
    setIsClientePickerOpen(false)
  }

  const handleCreateDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCreateFormValues((current) => ({
      ...current,
      fecha_entrega: event.target.value,
    }))
  }

  const handleProductoSearchChange = (index: number, value: string) => {
    setProductoSearchTerms((current) => ({
      ...current,
      [index]: value,
    }))

    setActiveProductoPickerIndex(index)

    setCreateFormValues((current) => ({
      ...current,
      detalles: current.detalles.map((detalle, detalleIndex) =>
        detalleIndex === index
          ? {
              ...detalle,
              id_producto: '',
            }
          : detalle,
      ),
    }))
  }

  const handleSelectProducto = (index: number, precio: PrecioItem) => {
    setCreateFormValues((current) => ({
      ...current,
      detalles: current.detalles.map((detalle, detalleIndex) =>
        detalleIndex === index
          ? {
              ...detalle,
              id_producto: String(precio.id_producto),
            }
          : detalle,
      ),
    }))

    setProductoSearchTerms((current) => ({
      ...current,
      [index]: getPrecioPickerLabel(precio),
    }))

    setActiveProductoPickerIndex(null)
  }

  const handleCantidadChange = (index: number, value: string) => {
    setCreateFormValues((current) => ({
      ...current,
      detalles: current.detalles.map((detalle, detalleIndex) =>
        detalleIndex === index
          ? {
              ...detalle,
              cantidad: value,
            }
          : detalle,
      ),
    }))
  }

  const handleAddDetalle = () => {
    setCreateFormValues((current) => ({
      ...current,
      detalles: [
        ...current.detalles,
        {
          id_producto: '',
          cantidad: '1',
        },
      ],
    }))
  }

  const handleRemoveDetalle = (index: number) => {
    if (createFormValues.detalles.length === 1) return

    setCreateFormValues((current) => ({
      ...current,
      detalles: current.detalles.filter(
        (_, detalleIndex) => detalleIndex !== index,
      ),
    }))

    setProductoSearchTerms((current) => {
      const next: Record<number, string> = {}

      Object.entries(current).forEach(([key, value]) => {
        const numericKey = Number(key)

        if (numericKey < index) {
          next[numericKey] = value
          return
        }

        if (numericKey > index) {
          next[numericKey - 1] = value
        }
      })

      return next
    })

    setCreateFormErrors((current) => ({
      ...current,
      detalleErrors: current.detalleErrors?.filter(
        (_, detalleIndex) => detalleIndex !== index,
      ),
    }))
  }

  const handleCreatePedidoSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    if (pedidoFormMode === 'create' && !canCreatePedido) return

    const errors = validateCreatePedidoForm(createFormValues)
    setCreateFormErrors(errors)

    if (hasCreatePedidoFormErrors(errors)) return

    try {
      if (pedidoFormMode === 'edit') {
        if (!editingPedidoId) {
          toast.error('No se pudo identificar el pedido a editar.')
          return
        }

        const updatedPedido = await updatePedido.mutateAsync({
          id: editingPedidoId,
          payload: buildPedidoPayload(createFormValues) as UpdatePedidoPayload,
        })

        toast.success('Pedido actualizado', {
          description: 'Los cambios del pedido se guardaron correctamente.',
        })

        setIsCreateSheetOpen(false)
        resetCreateForm()
        setSelectedPedidoId(updatedPedido.id)
        return
      }

      const createdPedido = await createPedido.mutateAsync(
        buildPedidoPayload(createFormValues) as CreatePedidoPayload,
      )

      toast.success('Pedido creado', {
        description: 'El pedido se registró correctamente.',
      })

      setPage(1)
      setIsCreateSheetOpen(false)
      resetCreateForm()
      setSelectedPedidoId(createdPedido.id)
    } catch (mutationError) {
      toast.error(
        pedidoFormMode === 'edit'
          ? 'No se pudo actualizar el pedido'
          : 'No se pudo crear el pedido',
        {
          description: getApiErrorMessage(
            mutationError,
            'Revisa los datos e intenta nuevamente.',
          ),
        },
      )
    }
  }

  const handleUpdateEstado = async (estado: PedidoEstado) => {
    if (!selectedPedidoId) return

    try {
      await updatePedidoEstado.mutateAsync({
        id: selectedPedidoId,
        estado,
      })

      toast.success('Estado actualizado', {
        description: `El pedido pasó a ${ESTADO_LABELS[estado]}.`,
      })
    } catch (mutationError) {
      toast.error('No se pudo actualizar el estado', {
        description: getApiErrorMessage(
          mutationError,
          'Revisa el estado actual, permisos o inventario disponible.',
        ),
      })
    }
  }

  return (
    <>
      <AdminTopBar
        title="Pedidos"
        breadcrumbs={[{ label: 'Pedidos' }]}
        primaryAction={
          !canCreatePedido
            ? undefined
            : {
                label: 'Nuevo pedido',
                onClick: handleOpenCreatePedidoSheet,
              }
        }
      />

      <div className="space-y-5 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1 shadow-soft">
            {ESTADO_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleEstadoFilterChange(tab.key)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  estadoFilter === tab.key
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {tab.label}
                <span
                  className={`rounded px-1.5 text-[10px] ${
                    estadoFilter === tab.key
                      ? 'bg-white/15 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {getEstadoCount(tab.key)}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center rounded-lg border border-border bg-card p-1 shadow-soft md:flex">
              <button
                type="button"
                onClick={() => setView('tabla')}
                className={`rounded px-2.5 py-1 text-xs font-medium ${
                  view === 'tabla'
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                Tabla
              </button>
              <button
                type="button"
                onClick={() => setView('kanban')}
                className={`rounded px-2.5 py-1 text-xs font-medium ${
                  view === 'kanban'
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                Kanban
              </button>
            </div>

            <Button variant="outline" size="sm" disabled>
              <Filter className="h-3.5 w-3.5" /> Filtros
            </Button>

            <Button variant="outline" size="sm" disabled>
              <Download className="h-3.5 w-3.5" /> Exportar
            </Button>

            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => void refetchPedidos()}
              disabled={isFetching}
              aria-label="Actualizar pedidos"
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {isError ? (
          <Card className="border-border bg-card p-6 shadow-soft">
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <div className="rounded-full bg-destructive/10 p-3 text-destructive">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">
                  No se pudieron cargar los pedidos
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {getApiErrorMessage(
                    error,
                    'Ocurrió un error al obtener los pedidos.',
                  )}
                </p>
              </div>
              <Button onClick={() => void refetchPedidos()} size="sm">
                Reintentar
              </Button>
            </div>
          </Card>
        ) : view === 'tabla' ? (
          <Card className="gap-0 overflow-hidden border-border bg-card p-0 shadow-soft">
            <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Buscar por cliente, # pedido o producto..."
                  className="h-8 bg-muted pl-8 text-xs"
                />
              </div>

              <div className="flex items-center gap-3">
                {searchTerm.trim() ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="h-3.5 w-3.5" />
                    Limpiar
                  </Button>
                ) : null}

                <p className="text-xs text-muted-foreground">
                  {filteredPedidos.length} resultado
                  {filteredPedidos.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            {isLoading ? (
              <PedidosTableSkeleton />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border bg-muted/40 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-5 py-3 text-left">Orden</th>
                        <th className="px-5 py-3 text-left">Cliente</th>
                        <th className="px-5 py-3 text-left">Producto</th>
                        <th className="px-5 py-3 text-left">Estado</th>
                        <th className="px-5 py-3 text-left">Entrega</th>
                        <th className="px-5 py-3 text-right">Total</th>
                        <th className="px-5 py-3" />
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-border">
                      {filteredPedidos.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-5 py-14 text-center">
                            <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                              <div className="rounded-full bg-muted p-3 text-muted-foreground">
                                <ShoppingCart className="h-6 w-6" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  No hay pedidos para mostrar
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  Crea un nuevo pedido o cambia los filtros de
                                  búsqueda.
                                </p>
                              </div>
                              {canCreatePedido ? (
                                <Button
                                  size="sm"
                                  onClick={handleOpenCreatePedidoSheet}
                                >
                                  <Plus className="h-4 w-4" /> Nuevo pedido
                                </Button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredPedidos.map((pedido) => {
                          const StatusIcon = ESTADO_ICONS[pedido.estado]

                          return (
                            <tr
                              key={pedido.id}
                              onClick={() => setSelectedPedidoId(pedido.id)}
                              className="cursor-pointer transition hover:bg-muted/40"
                            >
                              <td className="px-5 py-3.5">
                                <p className="font-mono text-xs font-semibold text-foreground">
                                  {getPedidoCode(pedido.id)}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {pedido.total_items} ítem
                                  {pedido.total_items === 1 ? '' : 's'}
                                </p>
                              </td>

                              <td className="px-5 py-3.5">
                                <p className="font-medium text-foreground">
                                  {pedido.cliente_nombre}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {pedido.cliente_nombre_contacto}
                                </p>
                              </td>

                              <td className="max-w-xs px-5 py-3.5">
                                <p className="truncate text-foreground/90">
                                  {pedido.producto_resumen}
                                </p>
                              </td>

                              <td className="px-5 py-3.5">
                                <Badge
                                  className={`${ESTADO_STYLES[pedido.estado]} gap-1 font-medium`}
                                >
                                  <StatusIcon className="h-3 w-3" />
                                  {ESTADO_LABELS[pedido.estado]}
                                </Badge>
                              </td>

                              <td className="px-5 py-3.5 text-muted-foreground">
                                {formatDate(pedido.fecha_entrega)}
                              </td>

                              <td className="px-5 py-3.5 text-right font-semibold tabular-nums">
                                {formatCurrency(pedido.total_pedido)}
                              </td>

                              <td className="px-5 py-3.5 text-right">
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    setSelectedPedidoId(pedido.id)
                                  }}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between border-t border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    Mostrando página {currentPage} de {Math.max(totalPages, 1)}
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                    >
                      <ChevronLeft className="h-4 w-4" /> Anterior
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        setPage((current) => Math.min(totalPages, current + 1))
                      }
                    >
                      Siguiente <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-5">
            {ESTADO_TABS.filter((tab) => tab.key !== 'todos').map((tab) => {
              const estado = tab.key as PedidoEstado
              const pedidosByEstado = pedidos.filter(
                (pedido) => pedido.estado === estado,
              )

              return (
                <Card
                  key={estado}
                  className="min-h-[320px] border-border bg-card p-3 shadow-soft"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-foreground">
                      {tab.label}
                    </h2>
                    <Badge variant="secondary">{pedidosByEstado.length}</Badge>
                  </div>

                  <div className="space-y-3">
                    {pedidosByEstado.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                        Sin pedidos
                      </div>
                    ) : (
                      pedidosByEstado.map((pedido) => (
                        <button
                          key={pedido.id}
                          type="button"
                          onClick={() => setSelectedPedidoId(pedido.id)}
                          className="w-full rounded-lg border border-border bg-background p-3 text-left shadow-soft transition hover:bg-muted/40"
                        >
                          <p className="font-mono text-xs font-semibold text-foreground">
                            {getPedidoCode(pedido.id)}
                          </p>
                          <p className="mt-1 text-sm font-medium text-foreground">
                            {pedido.cliente_nombre}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {pedido.producto_resumen}
                          </p>
                          <div className="mt-3 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {formatDate(pedido.fecha_entrega)}
                            </span>
                            <span className="font-semibold text-foreground">
                              {formatCurrency(pedido.total_pedido)}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <Sheet
        open={isCreateSheetOpen}
        onOpenChange={handleCreateSheetOpenChange}
      >
        <SheetContent className="flex h-full flex-col overflow-hidden p-0 sm:max-w-xl">
          <SheetHeader className="border-b border-border px-5 py-5 text-left sm:px-6">
            <SheetTitle>
              {pedidoFormMode === 'edit' ? 'Editar pedido' : 'Nuevo pedido'}
            </SheetTitle>
            <SheetDescription>
              {pedidoFormMode === 'edit'
                ? 'Actualiza el cliente, la fecha de entrega y los productos del pedido pendiente.'
                : 'Selecciona el cliente, la fecha de entrega y los productos del pedido.'}
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleCreatePedidoSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
              <div className="rounded-2xl border border-border p-4">
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground">
                    {pedidoFormMode === 'edit'
                      ? 'Información actualizada'
                      : 'Información del pedido'}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Busca el cliente y define una fecha estimada de entrega.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cliente_search">Cliente</Label>

                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="cliente_search"
                        value={clienteSearch}
                        onChange={handleClienteSearchChange}
                        onFocus={() => setIsClientePickerOpen(true)}
                        placeholder="Buscar por nombre, contacto, teléfono o email..."
                        className="pl-9"
                        disabled={isClientesLoading || isSavingPedido}
                      />
                    </div>

                    {createFormErrors.id_cliente && (
                      <p className="text-xs text-destructive">
                        {createFormErrors.id_cliente}
                      </p>
                    )}

                    {isClientePickerOpen && (
                      <div className="max-h-64 overflow-y-auto rounded-xl border border-border bg-background p-1 shadow-soft">
                        {isClientesLoading ? (
                          <div className="space-y-2 p-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                        ) : filteredClientes.length === 0 ? (
                          <div className="p-4 text-sm text-muted-foreground">
                            No se encontraron clientes.
                          </div>
                        ) : (
                          filteredClientes.map((cliente) => (
                            <button
                              key={cliente.id}
                              type="button"
                              onClick={() => handleSelectCliente(cliente)}
                              className={`w-full rounded-lg px-3 py-2 text-left transition hover:bg-muted ${
                                selectedCliente?.id === cliente.id
                                  ? 'bg-muted'
                                  : ''
                              }`}
                            >
                              <p className="text-sm font-medium text-foreground">
                                {getClienteDisplayName(cliente)}
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {cliente.nombre_contacto} · {cliente.telefono}
                              </p>
                              {cliente.email ? (
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                  {cliente.email}
                                </p>
                              ) : null}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha_entrega">Fecha de entrega</Label>
                    <Input
                      id="fecha_entrega"
                      type="date"
                      value={createFormValues.fecha_entrega}
                      onChange={handleCreateDateChange}
                      disabled={isSavingPedido}
                    />
                    {createFormErrors.fecha_entrega && (
                      <p className="text-xs text-destructive">
                        {createFormErrors.fecha_entrega}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border p-4">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Productos del pedido
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Solo aparecen productos que ya tienen precio registrado.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddDetalle}
                    disabled={isSavingPedido}
                  >
                    <Plus className="h-4 w-4" /> Agregar
                  </Button>
                </div>

                {createFormErrors.detalles && (
                  <p className="mb-3 text-xs text-destructive">
                    {createFormErrors.detalles}
                  </p>
                )}

                {isPreciosLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                  </div>
                ) : precios.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                    No hay productos con precio definido. Primero registra el
                    precio del producto para poder crear pedidos.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {createFormValues.detalles.map((detalle, index) => {
                      const selectedPrecio = getPrecioByProductoId(
                        detalle.id_producto,
                      )
                      const cantidad = Number(detalle.cantidad)
                      const subtotal =
                        selectedPrecio && Number.isFinite(cantidad)
                          ? selectedPrecio.precio_sugerido * cantidad
                          : 0
                      const filteredPrecios = getFilteredPrecios(index)
                      const isPickerOpen = activeProductoPickerIndex === index

                      return (
                        <div
                          key={index}
                          className="rounded-xl border border-border bg-muted/20 p-3"
                        >
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label>Producto</Label>

                              <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  value={productoSearchTerms[index] ?? ''}
                                  onChange={(event) =>
                                    handleProductoSearchChange(
                                      index,
                                      event.target.value,
                                    )
                                  }
                                  onFocus={() =>
                                    setActiveProductoPickerIndex(index)
                                  }
                                  placeholder="Buscar producto por nombre o precio..."
                                  className="pl-9"
                                  disabled={isSavingPedido}
                                />
                              </div>

                              {createFormErrors.detalleErrors?.[index]
                                ?.id_producto && (
                                <p className="text-xs text-destructive">
                                  {
                                    createFormErrors.detalleErrors[index]
                                      ?.id_producto
                                  }
                                </p>
                              )}

                              {isPickerOpen && (
                                <div className="max-h-60 overflow-y-auto rounded-xl border border-border bg-background p-1 shadow-soft">
                                  {filteredPrecios.length === 0 ? (
                                    <div className="p-4 text-sm text-muted-foreground">
                                      No se encontraron productos.
                                    </div>
                                  ) : (
                                    filteredPrecios.map((precio) => (
                                      <button
                                        key={precio.id}
                                        type="button"
                                        onClick={() =>
                                          handleSelectProducto(index, precio)
                                        }
                                        className={`w-full rounded-lg px-3 py-2 text-left transition hover:bg-muted ${
                                          selectedPrecio?.id === precio.id
                                            ? 'bg-muted'
                                            : ''
                                        }`}
                                      >
                                        <p className="text-sm font-medium text-foreground">
                                          {precio.nombre_producto}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                          Precio sugerido:{' '}
                                          {formatCurrency(
                                            precio.precio_sugerido,
                                          )}{' '}
                                          · Margen: {precio.margen_ganancia}%
                                        </p>
                                      </button>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="grid gap-3 sm:grid-cols-[140px_1fr_auto] sm:items-end">
                              <div className="space-y-2">
                                <Label>Cantidad</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  step={1}
                                  value={detalle.cantidad}
                                  onChange={(event) =>
                                    handleCantidadChange(
                                      index,
                                      event.target.value,
                                    )
                                  }
                                  disabled={isSavingPedido}
                                />
                                {createFormErrors.detalleErrors?.[index]
                                  ?.cantidad && (
                                  <p className="text-xs text-destructive">
                                    {
                                      createFormErrors.detalleErrors[index]
                                        ?.cantidad
                                    }
                                  </p>
                                )}
                              </div>

                              <div className="rounded-lg bg-background px-3 py-2 text-xs text-muted-foreground">
                                <p>
                                  Precio unitario:{' '}
                                  <span className="font-medium text-foreground">
                                    {selectedPrecio
                                      ? formatCurrency(
                                          selectedPrecio.precio_sugerido,
                                        )
                                      : '--'}
                                  </span>
                                </p>
                                <p className="mt-1">
                                  Subtotal estimado:{' '}
                                  <span className="font-medium text-foreground">
                                    {formatCurrency(subtotal)}
                                  </span>
                                </p>
                              </div>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleRemoveDetalle(index)}
                                disabled={
                                  isSavingPedido ||
                                  createFormValues.detalles.length === 1
                                }
                                aria-label="Eliminar producto"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total estimado
                  </span>
                  <span className="text-xl font-semibold text-foreground">
                    {formatCurrency(estimatedTotal)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  El total real lo calcula el backend usando el precio
                  registrado del producto.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border bg-background px-5 py-4 sm:px-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleCreateSheetOpenChange(false)}
                disabled={isSavingPedido}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={
                  isSavingPedido ||
                  isClientesLoading ||
                  isPreciosLoading ||
                  precios.length === 0
                }
              >
                {isSavingPedido ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Guardando...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    {pedidoFormMode === 'edit'
                      ? 'Guardar cambios'
                      : 'Crear pedido'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet
        open={selectedPedidoId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPedidoId(null)
          }
        }}
      >
        <SheetContent className="flex h-full flex-col overflow-hidden p-0 sm:max-w-2xl">
          <SheetHeader className="border-b border-border px-5 py-5 text-left sm:px-6">
            <SheetTitle>
              {selectedPedidoId ? getPedidoCode(selectedPedidoId) : 'Pedido'}
            </SheetTitle>
            <SheetDescription>
              Detalle general, productos y estado actual del pedido.
            </SheetDescription>
          </SheetHeader>

          {isDetailLoading ? (
            <PedidoDetailSkeleton />
          ) : isDetailError ? (
            <div className="px-5 py-6 sm:px-6">
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                {getApiErrorMessage(
                  detailError,
                  'No se pudo cargar el detalle del pedido.',
                )}
              </div>
            </div>
          ) : selectedPedido ? (
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-6 sm:px-6">
              <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-muted/20 p-4">
                <div>
                  <p className="font-mono text-sm font-semibold text-foreground">
                    {getPedidoCode(selectedPedido.id)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Creado por {selectedPedido.usuario_nombre}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedPedido.estado === 'pendiente' && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleOpenEditPedidoSheet}
                    >
                      <Pencil className="h-4 w-4" />
                      Editar pedido
                    </Button>
                  )}

                  <Badge
                    className={`${ESTADO_STYLES[selectedPedido.estado]} gap-1 font-medium`}
                  >
                    {ESTADO_LABELS[selectedPedido.estado]}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                    <User className="h-4 w-4" /> Cliente
                  </div>
                  <p className="font-medium text-foreground">
                    {selectedPedido.cliente_nombre_comercial}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Contacto: {selectedPedido.cliente_nombre_contacto}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Teléfono:{' '}
                    {selectedPedido.cliente_telefono ?? 'No registrado'}
                  </p>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                    <Calendar className="h-4 w-4" /> Fechas
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Creación:{' '}
                    <span className="font-medium text-foreground">
                      {formatDate(selectedPedido.fecha_creacion)}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Entrega:{' '}
                    <span className="font-medium text-foreground">
                      {formatDate(selectedPedido.fecha_entrega)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-border">
                <div className="border-b border-border px-4 py-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Package className="h-4 w-4" /> Productos del pedido
                  </h3>
                </div>

                <div className="divide-y divide-border">
                  {selectedPedido.detalles.map((detalle) => (
                    <div
                      key={detalle.id}
                      className="grid gap-3 px-4 py-3 sm:grid-cols-[1fr_auto]"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {detalle.producto_nombre}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Código: {detalle.producto_codigo} · Cantidad:{' '}
                          {detalle.cantidad}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-sm font-semibold text-foreground">
                          {formatCurrency(detalle.subtotal)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(detalle.precio_unitario)} c/u
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    Total
                  </span>
                  <span className="text-lg font-semibold text-foreground">
                    {formatCurrency(selectedPedido.total_pedido)}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-border p-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Cambiar estado
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Solo se muestran las transiciones permitidas para el estado
                  actual.
                </p>

                {selectedTransitions.length === 0 ? (
                  <div className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                    Este pedido ya no tiene transiciones disponibles.
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedTransitions.map((estado) => (
                      <Button
                        key={estado}
                        size="sm"
                        variant={estado === 'cancelado' ? 'outline' : 'default'}
                        onClick={() => void handleUpdateEstado(estado)}
                        disabled={updatePedidoEstado.isPending}
                      >
                        {updatePedidoEstado.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : estado === 'cancelado' ? (
                          <Ban className="h-4 w-4" />
                        ) : (
                          <Truck className="h-4 w-4" />
                        )}
                        Pasar a {ESTADO_LABELS[estado]}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  )
}
