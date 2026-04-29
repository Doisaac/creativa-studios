import { useState } from 'react'
import { AdminTopBar } from '../components/AdminTopBar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Calendar,
  User,
  Package,
  DollarSign,
  CheckCircle2,
  Truck,
  Edit3,
  MessageSquare,
} from 'lucide-react'

type Status = 'Pendiente' | 'En producción' | 'Finalizado' | 'Entregado'

const statusStyles: Record<Status, string> = {
  Pendiente: 'bg-muted text-foreground border border-border',
  'En producción': 'bg-info/10 text-info border border-info/20',
  Finalizado: 'bg-success/10 text-success border border-success/20',
  Entregado: 'bg-brand-muted text-accent-foreground border border-brand/20',
}

const orders = [
  {
    id: 'CR-1054',
    client: 'Café Verde',
    contact: 'andrea@cafeverde.sv',
    type: 'Branding completo',
    date: '29 Abr 2026',
    price: 480,
    status: 'En producción' as Status,
    items: 5,
  },
  {
    id: 'CR-1053',
    client: 'Auto Repuestos CM',
    contact: 'carlos@autocm.sv',
    type: 'Rotulación vehicular',
    date: '29 Abr 2026',
    price: 320,
    status: 'Pendiente' as Status,
    items: 2,
  },
  {
    id: 'CR-1052',
    client: 'Pastelería Dulce Hogar',
    contact: 'maria@dulcehogar.sv',
    type: '1,000 tarjetas premium',
    date: '28 Abr 2026',
    price: 95,
    status: 'Finalizado' as Status,
    items: 1,
  },
  {
    id: 'CR-1051',
    client: 'Clínica Salud+',
    contact: 'info@saludmas.sv',
    type: 'Señalética interior',
    date: '28 Abr 2026',
    price: 640,
    status: 'En producción' as Status,
    items: 12,
  },
  {
    id: 'CR-1050',
    client: 'Verde Studio',
    contact: 'hola@verde.sv',
    type: '200 stickers troquelados',
    date: '27 Abr 2026',
    price: 75,
    status: 'Entregado' as Status,
    items: 1,
  },
  {
    id: 'CR-1049',
    client: 'Norte SA',
    contact: 'pedidos@norte.sv',
    type: 'Banner 3x1.5m',
    date: '27 Abr 2026',
    price: 145,
    status: 'En producción' as Status,
    items: 1,
  },
  {
    id: 'CR-1048',
    client: 'Punto Azul',
    contact: 'ventas@puntoazul.sv',
    type: '50 camisas sublimadas',
    date: '26 Abr 2026',
    price: 425,
    status: 'Pendiente' as Status,
    items: 50,
  },
  {
    id: 'CR-1047',
    client: 'Casa Rivas',
    contact: 'rivas@correo.com',
    type: 'Brochures A4 plegado',
    date: '26 Abr 2026',
    price: 180,
    status: 'Entregado' as Status,
    items: 500,
  },
]

type Order = (typeof orders)[number]

const tabs: { key: 'todos' | Status; label: string; count: number }[] = [
  { key: 'todos', label: 'Todos', count: orders.length },
  {
    key: 'Pendiente',
    label: 'Pendiente',
    count: orders.filter((o) => o.status === 'Pendiente').length,
  },
  {
    key: 'En producción',
    label: 'En producción',
    count: orders.filter((o) => o.status === 'En producción').length,
  },
  {
    key: 'Finalizado',
    label: 'Finalizado',
    count: orders.filter((o) => o.status === 'Finalizado').length,
  },
  {
    key: 'Entregado',
    label: 'Entregado',
    count: orders.filter((o) => o.status === 'Entregado').length,
  },
]

export const PedidosPage = () => {
  const [view, setView] = useState<'tabla' | 'kanban'>('tabla')
  const [tab, setTab] = useState<(typeof tabs)[number]['key']>('todos')
  const [selected, setSelected] = useState<Order | null>(null)

  const filtered =
    tab === 'todos' ? orders : orders.filter((o) => o.status === tab)

  return (
    <>
      <AdminTopBar
        title="Pedidos"
        breadcrumbs={[{ label: 'Pedidos' }]}
        primaryAction={{ label: 'Nuevo pedido' }}
      />

      <div className="space-y-5 p-4 sm:p-6">
        {/* Tabs + view switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1 shadow-soft">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  tab === t.key
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {t.label}
                <span
                  className={`rounded px-1.5 text-[10px] ${tab === t.key ? 'bg-white/15 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center rounded-lg border border-border bg-card p-1 shadow-soft md:flex">
              <button
                onClick={() => setView('tabla')}
                className={`rounded px-2.5 py-1 text-xs font-medium ${view === 'tabla' ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
              >
                Tabla
              </button>
              <button
                onClick={() => setView('kanban')}
                className={`rounded px-2.5 py-1 text-xs font-medium ${view === 'kanban' ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
              >
                Kanban
              </button>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-3.5 w-3.5" /> Filtros
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-3.5 w-3.5" /> Exportar
            </Button>
          </div>
        </div>

        {view === 'tabla' ? (
          <Card className="gap-0 overflow-hidden border-border bg-card p-0 shadow-soft">
            <div className="flex items-center justify-between border-b border-border p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente, # orden o tipo…"
                  className="h-8 w-80 bg-muted pl-8 text-xs"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {filtered.length} resultados
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 text-left">Orden</th>
                    <th className="px-5 py-3 text-left">Cliente</th>
                    <th className="px-5 py-3 text-left">Tipo de trabajo</th>
                    <th className="px-5 py-3 text-left">Estado</th>
                    <th className="px-5 py-3 text-left">Fecha</th>
                    <th className="px-5 py-3 text-right">Costo</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((o) => (
                    <tr
                      key={o.id}
                      onClick={() => setSelected(o)}
                      className="cursor-pointer transition hover:bg-muted/40"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-mono text-xs font-semibold text-foreground">
                          {o.id}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {o.items} ítem{o.items > 1 ? 's' : ''}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-foreground">
                          {o.client}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {o.contact}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-foreground/90">
                        {o.type}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          className={`${statusStyles[o.status]} font-medium`}
                        >
                          {o.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {o.date}
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold tabular-nums">
                        ${o.price.toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-border p-3 text-xs text-muted-foreground">
              <p>
                Mostrando 1–{filtered.length} de {orders.length}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled>
                  Anterior
                </Button>
                <Button variant="outline" size="sm">
                  Siguiente
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <KanbanView orders={orders} onSelect={setSelected} />
        )}
      </div>

      <OrderDrawer order={selected} onClose={() => setSelected(null)} />
    </>
  )
}

function KanbanView({
  orders,
  onSelect,
}: {
  orders: Order[]
  onSelect: (o: Order) => void
}) {
  const cols: Status[] = [
    'Pendiente',
    'En producción',
    'Finalizado',
    'Entregado',
  ]
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {cols.map((col) => {
        const items = orders.filter((o) => o.status === col)
        return (
          <div
            key={col}
            className="rounded-xl border border-border bg-surface p-3"
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Badge className={`${statusStyles[col]} font-medium`}>
                  {col}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {items.length}
                </span>
              </div>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {items.map((o) => (
                <Card
                  key={o.id}
                  onClick={() => onSelect(o)}
                  className="cursor-pointer gap-2 border-border bg-card p-3.5 shadow-soft transition hover:shadow-elevated"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[11px] font-semibold text-muted-foreground">
                      {o.id}
                    </p>
                    <p className="text-xs font-semibold tabular-nums">
                      ${o.price}
                    </p>
                  </div>
                  <p className="text-sm font-semibold leading-tight">
                    {o.client}
                  </p>
                  <p className="text-xs text-muted-foreground">{o.type}</p>
                  <div className="mt-1 flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {o.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="h-3 w-3" /> {o.items}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function OrderDrawer({
  order,
  onClose,
}: {
  order: Order | null
  onClose: () => void
}) {
  return (
    <Sheet open={!!order} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {order && (
          <>
            <SheetHeader className="border-b border-border pb-5">
              <div className="flex items-center justify-between">
                <Badge
                  className={`${statusStyles[order.status as Status]} font-medium`}
                >
                  {order.status}
                </Badge>
                <p className="font-mono text-xs text-muted-foreground">
                  {order.id}
                </p>
              </div>
              <SheetTitle className="text-xl">{order.client}</SheetTitle>
              <SheetDescription>{order.type}</SheetDescription>
            </SheetHeader>

            <div className="space-y-6 py-6">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: User, label: 'Contacto', value: order.contact },
                  { icon: Calendar, label: 'Fecha', value: order.date },
                  {
                    icon: Package,
                    label: 'Ítems',
                    value: `${order.items} unidad${order.items > 1 ? 'es' : ''}`,
                  },
                  {
                    icon: DollarSign,
                    label: 'Total',
                    value: `$${order.price.toFixed(2)}`,
                  },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="rounded-lg border border-border bg-card p-3"
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      <m.icon className="h-3 w-3" /> {m.label}
                    </div>
                    <p className="mt-1.5 text-sm font-semibold">{m.value}</p>
                  </div>
                ))}
              </div>

              <Tabs defaultValue="detalle">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="detalle">Detalle</TabsTrigger>
                  <TabsTrigger value="produccion">Producción</TabsTrigger>
                  <TabsTrigger value="historial">Historial</TabsTrigger>
                </TabsList>
                <TabsContent value="detalle" className="space-y-3 pt-4">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h4 className="text-sm font-semibold">Especificaciones</h4>
                    <dl className="mt-3 grid grid-cols-2 gap-y-2 text-xs">
                      <dt className="text-muted-foreground">Sustrato</dt>
                      <dd className="text-right font-medium">
                        Papel couché 300g
                      </dd>
                      <dt className="text-muted-foreground">Acabado</dt>
                      <dd className="text-right font-medium">
                        Mate + barniz UV
                      </dd>
                      <dt className="text-muted-foreground">Cantidad</dt>
                      <dd className="text-right font-medium">{order.items}</dd>
                      <dt className="text-muted-foreground">Tiempo estimado</dt>
                      <dd className="text-right font-medium">3 días hábiles</dd>
                    </dl>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h4 className="text-sm font-semibold">Notas internas</h4>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Cliente solicita revisión de color antes de imprimir el
                      lote completo.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="produccion" className="pt-4">
                  <ol className="relative space-y-4 border-l border-border pl-5">
                    {[
                      {
                        l: 'Diseño aprobado',
                        done: true,
                        time: '27 Abr · 10:15',
                      },
                      {
                        l: 'Materiales reservados',
                        done: true,
                        time: '27 Abr · 14:00',
                      },
                      {
                        l: 'En impresión',
                        done: order.status !== 'Pendiente',
                        time: '28 Abr · 09:30',
                      },
                      {
                        l: 'Acabados',
                        done:
                          order.status === 'Finalizado' ||
                          order.status === 'Entregado',
                        time: '—',
                      },
                      {
                        l: 'Entrega al cliente',
                        done: order.status === 'Entregado',
                        time: '—',
                      },
                    ].map((s, i) => (
                      <li key={i} className="relative">
                        <span
                          className={`absolute -left-[26px] top-1 grid h-4 w-4 place-items-center rounded-full border-2 ${s.done ? 'border-success bg-success text-white' : 'border-border bg-card'}`}
                        >
                          {s.done && <CheckCircle2 className="h-2.5 w-2.5" />}
                        </span>
                        <p className="text-sm font-medium">{s.l}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.time}
                        </p>
                      </li>
                    ))}
                  </ol>
                </TabsContent>
                <TabsContent
                  value="historial"
                  className="space-y-2 pt-4 text-xs text-muted-foreground"
                >
                  <p>• 28 Abr · José M. cambió estado a En producción</p>
                  <p>• 27 Abr · María R. asignó a equipo de impresión</p>
                  <p>• 27 Abr · Andrea L. creó la orden</p>
                </TabsContent>
              </Tabs>
            </div>

            <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-2 border-t border-border bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-3.5 w-3.5" /> Comentar
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit3 className="h-3.5 w-3.5" /> Editar
                </Button>
                <Button size="sm" variant="default">
                  {order.status === 'Entregado' ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Cerrado
                    </>
                  ) : (
                    <>
                      <Truck className="h-3.5 w-3.5" /> Avanzar estado
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
