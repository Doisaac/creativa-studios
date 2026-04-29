import { AdminTopBar } from '../components/AdminTopBar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Mail, Phone, MapPin, MoreHorizontal } from 'lucide-react'

const clients = [
  {
    name: 'Café Verde',
    contact: 'Andrea Rivas',
    email: 'andrea@cafeverde.sv',
    phone: '+503 7123 4567',
    orders: 12,
    total: 4280,
    status: 'VIP',
  },
  {
    name: 'Auto Repuestos CM',
    contact: 'Carlos Menjívar',
    email: 'carlos@autocm.sv',
    phone: '+503 7234 5678',
    orders: 8,
    total: 2640,
    status: 'Activo',
  },
  {
    name: 'Pastelería Dulce Hogar',
    contact: 'María Hernández',
    email: 'maria@dulcehogar.sv',
    phone: '+503 7345 6789',
    orders: 24,
    total: 5920,
    status: 'VIP',
  },
  {
    name: 'Clínica Salud+',
    contact: 'Dr. Jorge Alfaro',
    email: 'info@saludmas.sv',
    phone: '+503 7456 7890',
    orders: 6,
    total: 3840,
    status: 'Activo',
  },
  {
    name: 'Verde Studio',
    contact: 'Luis Pérez',
    email: 'hola@verde.sv',
    phone: '+503 7567 8901',
    orders: 3,
    total: 425,
    status: 'Nuevo',
  },
  {
    name: 'Norte SA',
    contact: 'Patricia López',
    email: 'pedidos@norte.sv',
    phone: '+503 7678 9012',
    orders: 14,
    total: 3120,
    status: 'Activo',
  },
]

const statusColor: Record<string, string> = {
  VIP: 'bg-brand-muted text-accent-foreground border border-brand/20',
  Activo: 'bg-success/10 text-success border border-success/20',
  Nuevo: 'bg-info/10 text-info border border-info/20',
}

export const ClientesPage = () => {
  return (
    <>
      <AdminTopBar
        title="Clientes"
        breadcrumbs={[{ label: 'Clientes' }]}
        primaryAction={{ label: 'Nuevo cliente' }}
      />
      <div className="space-y-5 p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="gap-1 border-border bg-card p-5 shadow-soft">
            <p className="text-xs text-muted-foreground">Total clientes</p>
            <p className="text-2xl font-semibold">524</p>
          </Card>
          <Card className="gap-1 border-border bg-card p-5 shadow-soft">
            <p className="text-xs text-muted-foreground">Activos este mes</p>
            <p className="text-2xl font-semibold">82</p>
          </Card>
          <Card className="gap-1 border-border bg-card p-5 shadow-soft">
            <p className="text-xs text-muted-foreground">Ingresos del mes</p>
            <p className="text-2xl font-semibold">$ 18,420</p>
          </Card>
        </div>

        <Card className="gap-0 overflow-hidden border-border bg-card p-0 shadow-soft">
          <div className="flex items-center justify-between border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente, contacto…"
                className="h-8 w-80 bg-muted pl-8 text-xs"
              />
            </div>
          </div>
          <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-3">
            {clients.map((c) => (
              <div
                key={c.name}
                className="bg-card p-5 transition hover:bg-surface"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand/60 text-sm font-semibold text-brand-foreground">
                      {c.name
                        .split(' ')
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.contact}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${statusColor[c.status]} font-medium`}>
                    {c.status}
                  </Badge>
                </div>
                <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3" /> {c.email}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3" /> {c.phone}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" /> Santa Ana
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Pedidos · Total facturado
                    </p>
                    <p className="text-sm font-semibold">
                      {c.orders} ·{' '}
                      <span className="tabular-nums">
                        ${c.total.toLocaleString()}
                      </span>
                    </p>
                  </div>
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}

export default ClientesPage
