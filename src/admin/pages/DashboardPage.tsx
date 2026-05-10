import { useMemo } from 'react'
import {
  AlertTriangle,
  Boxes,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Factory,
  Loader2,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useAuthStore } from '@/auth/store/authStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/lib/get-api-error-message'
import { formatDateTime } from '@/lib/format-date'
import { cn } from '@/lib/utils'
import { AdminTopBar } from '../components/AdminTopBar'
import { useDashboardInventoryOverview } from '../hooks/useDashboardInventoryOverview'
import { useDashboardOrdersOverview } from '../hooks/useDashboardOrdersOverview'
import { useInventarioLowStock } from '../hooks/useInventarioLowStock'
import type { InventarioItem } from '../types/inventario'
import type { PedidoEstado, PedidoListItem } from '../types/pedidos'

const DASHBOARD_TIME_ZONE = 'America/El_Salvador'

const currencyFormatter = new Intl.NumberFormat('es-SV', {
  style: 'currency',
  currency: 'USD',
})

const dateFormatter = new Intl.DateTimeFormat('es-SV', {
  timeZone: DASHBOARD_TIME_ZONE,
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: DASHBOARD_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const relativeDayFormatter = new Intl.RelativeTimeFormat('es', {
  numeric: 'auto',
})

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

const RELEVANT_DELIVERY_STATES: PedidoEstado[] = [
  'pendiente',
  'produccion',
  'finalizado',
]

const getPedidoCode = (id: number) => `PED-${String(id).padStart(4, '0')}`

const formatCurrency = (value: number) => currencyFormatter.format(value)

const formatDate = (value: string | null) => {
  if (!value) return 'Sin fecha'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Fecha inválida'
  }

  return dateFormatter.format(date)
}

const toDayKey = (value: Date | string) =>
  dayKeyFormatter.format(typeof value === 'string' ? new Date(value) : value)

const addDays = (date: Date, days: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const getClientName = (pedido: PedidoListItem) =>
  pedido.cliente_nombre_comercial?.trim() || pedido.cliente_nombre

const getInventoryChartItems = (items: InventarioItem[]) => {
  if (items.length <= 5) {
    return [...items].sort((a, b) => a.stock_actual - b.stock_actual)
  }

  const lowest = [...items]
    .sort((a, b) => a.stock_actual - b.stock_actual)
    .slice(0, 3)
  const highest = [...items]
    .sort((a, b) => b.stock_actual - a.stock_actual)
    .slice(0, 3)

  const uniqueItems = new Map<number, InventarioItem>()

  ;[...lowest, ...highest].forEach((item) => {
    uniqueItems.set(item.id, item)
  })

  const combined = Array.from(uniqueItems.values()).sort(
    (a, b) => a.stock_actual - b.stock_actual,
  )

  if (combined.length >= 5) {
    return combined
  }

  const remaining = [...items]
    .sort((a, b) => a.stock_actual - b.stock_actual)
    .filter((item) => !uniqueItems.has(item.id))
    .slice(0, 5 - combined.length)

  return [...combined, ...remaining].sort(
    (a, b) => a.stock_actual - b.stock_actual,
  )
}

const getInventoryChartLabel = (name: string) =>
  name.length > 18 ? `${name.slice(0, 18)}...` : name

const SectionError = ({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) => (
  <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-destructive/30 bg-destructive/5 p-6 text-center">
    <AlertTriangle className="h-7 w-7 text-destructive" />
    <div className="space-y-1">
      <p className="font-medium text-foreground">
        No se pudo cargar la sección
      </p>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
    <Button size="sm" variant="outline" onClick={onRetry}>
      Reintentar
    </Button>
  </div>
)

const SummaryCardSkeleton = () => (
  <Card className="border-border bg-card shadow-soft">
    <CardContent className="flex items-center gap-4 p-6">
      <Skeleton className="h-11 w-11 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-28" />
      </div>
    </CardContent>
  </Card>
)

const ListSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="rounded-xl border border-border bg-background p-4"
      >
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-3 h-3 w-40" />
        <Skeleton className="mt-2 h-3 w-32" />
      </div>
    ))}
  </div>
)

const InventoryChartSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
      </div>
    ))}
  </div>
)

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user)
  const displayName = user?.nombre ?? 'Usuario'

  const {
    data: ordersOverview,
    error: ordersError,
    isError: isOrdersError,
    isLoading: isOrdersLoading,
    isFetching: isOrdersFetching,
    refetch: refetchOrders,
  } = useDashboardOrdersOverview()

  const {
    data: inventoryOverview,
    error: inventoryError,
    isError: isInventoryError,
    isLoading: isInventoryLoading,
    isFetching: isInventoryFetching,
    refetch: refetchInventory,
  } = useDashboardInventoryOverview()

  const {
    data: lowStockItems,
    error: lowStockError,
    isError: isLowStockError,
    isLoading: isLowStockLoading,
    isFetching: isLowStockFetching,
    refetch: refetchLowStock,
  } = useInventarioLowStock()

  const today = useMemo(() => new Date(), [])
  const todayKey = useMemo(() => toDayKey(today), [today])
  const tomorrowKey = useMemo(() => toDayKey(addDays(today, 1)), [today])

  const pedidos = useMemo(() => ordersOverview?.pedidos ?? [], [ordersOverview])
  const inventoryItems = useMemo(
    () => inventoryOverview?.items ?? [],
    [inventoryOverview],
  )

  const pedidoCounts = useMemo(
    () => ({
      pendiente: pedidos.filter((pedido) => pedido.estado === 'pendiente')
        .length,
      produccion: pedidos.filter((pedido) => pedido.estado === 'produccion')
        .length,
      finalizado: pedidos.filter((pedido) => pedido.estado === 'finalizado')
        .length,
    }),
    [pedidos],
  )

  const todayDeliveries = useMemo(
    () =>
      pedidos
        .filter(
          (pedido) =>
            pedido.fecha_entrega &&
            toDayKey(pedido.fecha_entrega) === todayKey &&
            RELEVANT_DELIVERY_STATES.includes(pedido.estado),
        )
        .sort((a, b) => {
          const first = a.fecha_entrega
            ? new Date(a.fecha_entrega).getTime()
            : 0
          const second = b.fecha_entrega
            ? new Date(b.fecha_entrega).getTime()
            : 0
          return first - second
        }),
    [pedidos, todayKey],
  )

  const urgentOrders = useMemo(
    () =>
      pedidos
        .filter(
          (pedido) =>
            pedido.fecha_entrega &&
            RELEVANT_DELIVERY_STATES.includes(pedido.estado) &&
            [todayKey, tomorrowKey].includes(toDayKey(pedido.fecha_entrega)),
        )
        .sort((a, b) => {
          const first = a.fecha_entrega
            ? new Date(a.fecha_entrega).getTime()
            : 0
          const second = b.fecha_entrega
            ? new Date(b.fecha_entrega).getTime()
            : 0
          return first - second
        }),
    [pedidos, todayKey, tomorrowKey],
  )

  const chartItems = useMemo(
    () => getInventoryChartItems(inventoryItems),
    [inventoryItems],
  )

  const inventoryChartData = useMemo(
    () =>
      chartItems.map((item) => ({
        id: item.id,
        nombre: item.nombre,
        nombreCorto: getInventoryChartLabel(item.nombre),
        stockActual: item.stock_actual,
        stockMinimo: item.stock_minimo,
        unidad: item.unidad_de_medida,
        bajoStock: item.bajo_stock,
      })),
    [chartItems],
  )

  const summaryCards = [
    {
      label: 'Pendientes',
      value: pedidoCounts.pendiente,
      icon: Clock3,
      tint: 'bg-muted text-foreground',
    },
    {
      label: 'En producción',
      value: pedidoCounts.produccion,
      icon: Factory,
      tint: 'bg-info/10 text-info',
    },
    {
      label: 'Finalizados / listos',
      value: pedidoCounts.finalizado,
      icon: PackageCheck,
      tint: 'bg-success/10 text-success',
    },
    {
      label: 'Entregas para hoy',
      value: todayDeliveries.length,
      icon: CalendarClock,
      tint: 'bg-brand-muted text-accent-foreground',
    },
  ]

  return (
    <>
      <AdminTopBar title={`Buen día, ${displayName}`} />

      <div className="space-y-6 p-4 sm:p-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isOrdersLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <SummaryCardSkeleton key={index} />
              ))
            : summaryCards.map((item) => (
                <Card
                  key={item.label}
                  className="border-border bg-card shadow-soft"
                >
                  <CardContent className="flex items-center gap-4 p-6">
                    <span
                      className={cn(
                        'grid h-11 w-11 place-items-center rounded-xl',
                        item.tint,
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-3xl font-semibold tracking-tight">
                        {item.value}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.label}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <Card className="border-border bg-card shadow-soft">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Entregas de hoy
              </CardTitle>
              <CardDescription>
                Pedidos con fecha de entrega para{' '}
                {formatDate(today.toISOString())}.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {isOrdersLoading ? (
                <ListSkeleton />
              ) : isOrdersError ? (
                <SectionError
                  message={getApiErrorMessage(
                    ordersError,
                    'No se pudieron obtener los pedidos del dashboard.',
                  )}
                  onRetry={() => void refetchOrders()}
                />
              ) : todayDeliveries.length === 0 ? (
                <div className="flex min-h-52 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
                  <CalendarClock className="h-8 w-8 text-muted-foreground" />
                  <p className="font-medium">
                    No hay entregas programadas para hoy
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Cuando existan pedidos para entregar hoy aparecerán aquí.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayDeliveries.map((pedido) => (
                    <div
                      key={pedido.id}
                      className="rounded-xl border border-border bg-background p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">
                            {getPedidoCode(pedido.id)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {getClientName(pedido)}
                          </p>
                        </div>
                        <Badge className={ESTADO_STYLES[pedido.estado]}>
                          {ESTADO_LABELS[pedido.estado]}
                        </Badge>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                        <p>Entrega: {formatDateTime(pedido.fecha_entrega)}</p>
                        <p>Total: {formatCurrency(pedido.total_pedido)}</p>
                        <p className="truncate">
                          Resumen: {pedido.producto_resumen || 'Sin detalle'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-soft">
            <CardHeader className="border-b border-border">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Pedidos urgentes
                  </CardTitle>
                  <CardDescription>
                    Entregas relevantes para hoy y mañana.
                  </CardDescription>
                </div>
                {isOrdersFetching ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isOrdersLoading ? (
                <ListSkeleton />
              ) : isOrdersError ? (
                <SectionError
                  message={getApiErrorMessage(
                    ordersError,
                    'No se pudieron obtener los pedidos urgentes.',
                  )}
                  onRetry={() => void refetchOrders()}
                />
              ) : urgentOrders.length === 0 ? (
                <div className="flex min-h-52 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
                  <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                  <p className="font-medium">No hay pedidos urgentes</p>
                  <p className="text-sm text-muted-foreground">
                    No existen entregas para hoy o mañana en estados activos.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {urgentOrders.map((pedido) => {
                    const deliveryDayKey = pedido.fecha_entrega
                      ? toDayKey(pedido.fecha_entrega)
                      : ''
                    const isToday = deliveryDayKey === todayKey
                    const dayLabel = isToday ? 'Hoy' : 'Mañana'

                    return (
                      <div
                        key={pedido.id}
                        className="rounded-xl border border-border bg-background p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-foreground">
                              {getPedidoCode(pedido.id)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {getClientName(pedido)}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant={isToday ? 'destructive' : 'secondary'}
                            >
                              {dayLabel}
                            </Badge>
                            <Badge className={ESTADO_STYLES[pedido.estado]}>
                              {ESTADO_LABELS[pedido.estado]}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span>{formatDateTime(pedido.fecha_entrega)}</span>
                          <span>{formatCurrency(pedido.total_pedido)}</span>
                          <span>
                            {relativeDayFormatter.format(
                              isToday ? 0 : 1,
                              'day',
                            )}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <Card className="border-border bg-card shadow-soft">
            <CardHeader className="border-b border-border">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Boxes className="h-4 w-4" />
                    Inventario actual
                  </CardTitle>
                  <CardDescription>
                    Comparativa de stock entre materiales con niveles más bajos
                    y más altos.
                  </CardDescription>
                </div>
                {isInventoryFetching ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isInventoryLoading ? (
                <InventoryChartSkeleton />
              ) : isInventoryError ? (
                <SectionError
                  message={getApiErrorMessage(
                    inventoryError,
                    'No se pudo cargar el inventario del dashboard.',
                  )}
                  onRetry={() => void refetchInventory()}
                />
              ) : chartItems.length === 0 ? (
                <div className="flex min-h-52 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
                  <Boxes className="h-8 w-8 text-muted-foreground" />
                  <p className="font-medium">No hay inventario disponible</p>
                  <p className="text-sm text-muted-foreground">
                    El gráfico aparecerá cuando existan materiales registrados.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={inventoryChartData}
                        margin={{ top: 8, right: 8, left: -16, bottom: 8 }}
                      >
                        <CartesianGrid
                          vertical={false}
                          stroke="var(--color-border)"
                          strokeDasharray="3 3"
                        />
                        <XAxis
                          dataKey="nombreCorto"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={10}
                          className="text-xs"
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                          className="text-xs"
                        />
                        <Tooltip
                          cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                          content={({ active, payload }) => {
                            if (!active || !payload || payload.length === 0) {
                              return null
                            }

                            const data = payload[0]?.payload as
                              | {
                                  nombre: string
                                  stockActual: number
                                  stockMinimo: number
                                  unidad: string
                                  bajoStock: boolean
                                }
                              | undefined

                            if (!data) {
                              return null
                            }

                            return (
                              <div className="rounded-xl border border-border bg-background px-3 py-2 shadow-md">
                                <p className="max-w-56 text-sm font-medium text-foreground">
                                  {data.nombre}
                                </p>
                                <p className="mt-2 text-xs text-muted-foreground">
                                  Stock actual:{' '}
                                  <span className="font-medium text-foreground">
                                    {data.stockActual} {data.unidad}
                                  </span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Stock mínimo:{' '}
                                  <span className="font-medium text-foreground">
                                    {data.stockMinimo} {data.unidad}
                                  </span>
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Estado:{' '}
                                  <span
                                    className={cn(
                                      'font-medium',
                                      data.bajoStock
                                        ? 'text-warning-foreground'
                                        : 'text-foreground',
                                    )}
                                  >
                                    {data.bajoStock ? 'Bajo stock' : 'En stock'}
                                  </span>
                                </p>
                              </div>
                            )
                          }}
                        />
                        <Bar
                          dataKey="stockActual"
                          radius={[10, 10, 0, 0]}
                          maxBarSize={52}
                        >
                          {inventoryChartData.map((item) => (
                            <Cell
                              key={item.id}
                              fill={
                                item.bajoStock
                                  ? 'hsl(var(--warning))'
                                  : 'hsl(var(--primary))'
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {chartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {item.nombre}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Mínimo: {item.stock_minimo} {item.unidad_de_medida}
                          </p>
                        </div>
                        <Badge
                          variant={item.bajo_stock ? 'secondary' : 'outline'}
                          className={cn(
                            item.bajo_stock
                              ? 'bg-warning/15 text-warning-foreground border-warning/30'
                              : '',
                          )}
                        >
                          {item.stock_actual} {item.unidad_de_medida}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-soft">
            <CardHeader className="border-b border-border">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Alertas de stock bajo
                  </CardTitle>
                  <CardDescription>
                    Materiales reportados por el endpoint `low-stock`.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void refetchLowStock()}
                  disabled={isLowStockFetching}
                >
                  {isLowStockFetching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Actualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isLowStockLoading ? (
                <ListSkeleton />
              ) : isLowStockError ? (
                <SectionError
                  message={getApiErrorMessage(
                    lowStockError,
                    'No se pudo cargar el inventario con bajo stock.',
                  )}
                  onRetry={() => void refetchLowStock()}
                />
              ) : !lowStockItems || lowStockItems.length === 0 ? (
                <div className="flex min-h-52 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
                  <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                  <p className="font-medium">Sin alertas activas</p>
                  <p className="text-sm text-muted-foreground">
                    No hay materiales por debajo del stock mínimo.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-warning/30 bg-warning/10 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">
                            {item.nombre}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Stock actual: {item.stock_actual}{' '}
                            {item.unidad_de_medida}
                          </p>
                        </div>
                        <Badge className="bg-warning/20 text-warning-foreground border border-warning/30">
                          Bajo stock
                        </Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span>Mínimo: {item.stock_minimo}</span>
                        <span>Unidad: {item.unidad_de_medida}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  )
}
