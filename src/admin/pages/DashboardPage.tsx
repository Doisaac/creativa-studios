import {
  ShoppingBag,
  Clock,
  Factory,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdminTopBar } from '../components/AdminTopBar'

const metrics = [
  {
    icon: ShoppingBag,
    label: 'Pedidos activos',
    value: '4',
    delta: '+12%',
    up: true,
    sub: 'vs. semana anterior',
  },
  {
    icon: Clock,
    label: 'Trabajos pendientes',
    value: '18',
    delta: '-4%',
    up: false,
    sub: 'menos backlog',
  },
  {
    icon: Factory,
    label: 'En producción',
    value: '23',
    delta: '+8%',
    up: true,
    sub: '8 máquinas activas',
  },
  {
    icon: Truck,
    label: 'Entregas hoy',
    value: '9',
    delta: '+3',
    up: true,
    sub: 'ruta Santa Ana',
  },
]

const recent = [
  {
    id: 'ORD-2401',
    client: 'Café Boreal',
    item: 'Tarjetas premium · 500 uds',
    status: 'Producción',
    color: 'bg-brand/15 text-brand',
  },
  {
    id: 'ORD-2400',
    client: 'Boutique Lumen',
    item: 'Etiquetas adhesivas · 1.000 uds',
    status: 'En diseño',
    color: 'bg-warning/15 text-warning-foreground',
  },
  {
    id: 'ORD-2399',
    client: 'Estudio Dental',
    item: 'Brochure tríptico A4',
    status: 'Pendiente',
    color: 'bg-muted text-muted-foreground',
  },
  {
    id: 'ORD-2398',
    client: 'Gym Forge',
    item: 'Banner 3x1m + roll-up',
    status: 'Terminado',
    color: 'bg-success/15 text-success',
  },
  {
    id: 'ORD-2397',
    client: 'Pan & Co.',
    item: 'Bolsas kraft personalizadas',
    status: 'Entregado',
    color: 'bg-secondary text-foreground/70',
  },
]

export const DashboardPage = () => {
  return (
    <div className="space-y-8">
      <AdminTopBar title="Buen día, Douglas 👋🏻" />

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 p-4 sm:p-6">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <m.icon className="h-5 w-5 text-brand" />
              </div>
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
                  m.up
                    ? 'bg-success/15 text-success'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {m.up ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {m.delta}
              </span>
            </div>
            <div className="mt-4 font-display text-3xl">{m.value}</div>
            <div className="mt-1 text-sm font-medium">{m.label}</div>
            <div className="text-xs text-muted-foreground">{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 p-4 sm:p-6">
        {/* Activity */}
        <div className="rounded-2xl border border-border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="font-display text-xl">Actividad reciente</h2>
              <p className="text-xs text-muted-foreground">
                Últimos pedidos en el flujo
              </p>
            </div>
            <button className="text-xs font-medium text-muted-foreground hover:text-foreground">
              Ver todo →
            </button>
          </div>
          <div className="divide-y divide-border">
            {recent.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/40"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft font-display text-sm text-brand">
                  {r.client[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{r.client}</span>
                    <span className="text-xs text-muted-foreground">
                      · {r.id}
                    </span>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {r.item}
                  </div>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-medium',
                    r.color,
                  )}
                >
                  {r.status}
                </span>
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Side: alerts + urgent */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display text-lg">Pedidos urgentes</h3>
            <p className="text-xs text-muted-foreground">
              Entrega en menos de 24h
            </p>
            <ul className="mt-4 space-y-3">
              {[
                { c: 'Café Boreal', t: 'Hoy · 16:00' },
                { c: 'Estudio Dental', t: 'Mañana · 09:00' },
                { c: 'Pan & Co.', t: 'Mañana · 12:00' },
              ].map((u) => (
                <li
                  key={u.c}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
                >
                  <div className="h-2 w-2 rounded-full bg-brand" />
                  <div className="flex-1 text-sm">
                    <div className="font-medium">{u.c}</div>
                    <div className="text-xs text-muted-foreground">{u.t}</div>
                  </div>
                  <button className="text-xs font-medium text-brand">
                    Ver
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display text-lg">Alertas</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3 rounded-lg bg-destructive/10 p-3 text-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
                <div>
                  <div className="font-medium text-destructive">
                    Stock bajo: Vinil blanco
                  </div>
                  <div className="text-xs text-destructive/80">
                    Solo quedan 3 rollos.
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3 rounded-lg bg-success/10 p-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
                <div>
                  <div className="font-medium text-success">
                    Mantenimiento completado
                  </div>
                  <div className="text-xs text-success/80">
                    Plotter Roland operativo.
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
