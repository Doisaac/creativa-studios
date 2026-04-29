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
import {
  Search,
  Filter,
  Download,
  Boxes,
  AlertTriangle,
  MapPin,
  Truck,
  Edit3,
  Trash,
} from 'lucide-react'

type Stock = 'En stock' | 'Bajo stock' | 'Agotado'
const stockColor: Record<Stock, string> = {
  'En stock': 'bg-success/10 text-success border border-success/20',
  'Bajo stock':
    'bg-warning/15 text-warning-foreground border border-warning/30',
  Agotado: 'bg-destructive/10 text-destructive border border-destructive/20',
}

const items = [
  {
    sku: 'VIN-122-WHT',
    name: 'Vinil corte blanco 1.22m',
    stock: 8,
    min: 25,
    location: 'Bodega A · Estante 3',
    supplier: 'Sintex SA',
    status: 'Bajo stock' as Stock,
    unit: 'metros',
  },
  {
    sku: 'TIN-SUB-CYN',
    name: 'Tinta sublimación cyan',
    stock: 1,
    min: 4,
    location: 'Bodega B · Cajón 1',
    supplier: 'PrintPro',
    status: 'Agotado' as Stock,
    unit: 'cartuchos',
  },
  {
    sku: 'PAP-COU-300',
    name: 'Papel couché 300g A3',
    stock: 240,
    min: 100,
    location: 'Bodega A · Estante 1',
    supplier: 'PaperCo',
    status: 'En stock' as Stock,
    unit: 'hojas',
  },
  {
    sku: 'LON-BAN-13',
    name: 'Lona banner 13oz',
    stock: 14,
    min: 20,
    location: 'Bodega A · Estante 5',
    supplier: 'Sintex SA',
    status: 'Bajo stock' as Stock,
    unit: 'metros',
  },
  {
    sku: 'TAZ-SUB-11',
    name: 'Tazas sublimables 11oz',
    stock: 86,
    min: 30,
    location: 'Bodega C · Estante 2',
    supplier: 'MugMaster',
    status: 'En stock' as Stock,
    unit: 'unidades',
  },
  {
    sku: 'CAM-DT-100',
    name: 'Camisas algodón DTF',
    stock: 142,
    min: 50,
    location: 'Bodega C · Estante 4',
    supplier: 'Textil Norte',
    status: 'En stock' as Stock,
    unit: 'unidades',
  },
  {
    sku: 'VIN-LAM-MA',
    name: 'Vinil laminado mate',
    stock: 32,
    min: 20,
    location: 'Bodega A · Estante 3',
    supplier: 'Sintex SA',
    status: 'En stock' as Stock,
    unit: 'metros',
  },
]

export const InventarioPage = () => {
  const [selected, setSelected] = useState<(typeof items)[number] | null>(null)

  return (
    <>
      <AdminTopBar
        title="Inventario"
        breadcrumbs={[{ label: 'Inventario' }]}
        primaryAction={{ label: 'Nuevo producto' }}
      />

      <div className="space-y-5 p-4 sm:p-6">
        {/* Summary cards */}
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            {
              label: 'Total productos',
              value: items.length.toString(),
              icon: Boxes,
              tint: 'bg-info/10 text-info',
            },
            {
              label: 'En stock',
              value: items
                .filter((i) => i.status === 'En stock')
                .length.toString(),
              icon: Boxes,
              tint: 'bg-success/10 text-success',
            },
            {
              label: 'Bajo stock',
              value: items
                .filter((i) => i.status === 'Bajo stock')
                .length.toString(),
              icon: AlertTriangle,
              tint: 'bg-warning/15 text-warning-foreground',
            },
            {
              label: 'Agotados',
              value: items
                .filter((i) => i.status === 'Agotado')
                .length.toString(),
              icon: AlertTriangle,
              tint: 'bg-destructive/10 text-destructive',
            },
          ].map((s) => (
            <Card
              key={s.label}
              className="flex-row items-center gap-4 border-border bg-card p-4 shadow-soft"
            >
              <span
                className={`grid h-10 w-10 place-items-center rounded-lg ${s.tint}`}
              >
                <s.icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-2xl font-semibold tracking-tight">
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="gap-0 overflow-hidden border-border bg-card p-0 shadow-soft">
          <div className="flex items-center justify-between border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar SKU, producto o proveedor…"
                className="h-8 w-80 bg-muted pl-8 text-xs"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-3.5 w-3.5" /> Filtros
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-3.5 w-3.5" /> Exportar
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left">Producto</th>
                  <th className="px-5 py-3 text-left">Stock</th>
                  <th className="px-5 py-3 text-left">Mínimo</th>
                  <th className="px-5 py-3 text-left">Estado</th>
                  <th className="px-5 py-3 text-left">Ubicación</th>
                  <th className="px-5 py-3 text-left">Proveedor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((i) => {
                  const pct = Math.min(
                    100,
                    (i.stock / Math.max(i.min * 2, 1)) * 100,
                  )
                  return (
                    <tr
                      key={i.sku}
                      onClick={() => setSelected(i)}
                      className="cursor-pointer transition hover:bg-muted/40"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-medium">{i.name}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {i.sku}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold tabular-nums">
                            {i.stock}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {i.unit}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${i.status === 'Agotado' ? 'bg-destructive' : i.status === 'Bajo stock' ? 'bg-warning' : 'bg-success'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {i.min}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          className={`${stockColor[i.status]} font-medium`}
                        >
                          {i.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {i.location}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {i.supplier}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto overflow-x-hidden sm:max-w-xl">
          {selected && (
            <>
              <SheetHeader className="border-b border-border pb-5">
                <Badge
                  className={`${stockColor[selected.status]} w-fit font-medium`}
                >
                  {selected.status}
                </Badge>
                <SheetTitle className="text-xl">{selected.name}</SheetTitle>
                <SheetDescription className="font-mono text-xs">
                  {selected.sku}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-5 py-6">
                <div className="rounded-xl border border-border bg-gradient-to-br from-card to-muted p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Stock actual
                  </p>
                  <p className="mt-1 text-4xl font-semibold tabular-nums">
                    {selected.stock}{' '}
                    <span className="text-base font-normal text-muted-foreground">
                      {selected.unit}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Mínimo recomendado: {selected.min}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Card className="gap-1 border-border bg-card p-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> Ubicación
                    </div>
                    <p className="text-sm font-semibold">{selected.location}</p>
                  </Card>
                  <Card className="gap-1 border-border bg-card p-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Truck className="h-3 w-3" /> Proveedor
                    </div>
                    <p className="text-sm font-semibold">{selected.supplier}</p>
                  </Card>
                </div>

                <Card className="gap-3 border-border bg-card p-4">
                  <h4 className="text-sm font-semibold">
                    Movimientos recientes
                  </h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">
                        29 Abr · Salida pedido CR-1054
                      </span>
                      <span className="font-medium text-destructive">-3</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">
                        28 Abr · Entrada de proveedor
                      </span>
                      <span className="font-medium text-success">+15</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">
                        27 Abr · Salida pedido CR-1051
                      </span>
                      <span className="font-medium text-destructive">-4</span>
                    </li>
                  </ul>
                </Card>
              </div>

              <div className="sticky bottom-0 -mx-4 flex w-full items-center justify-end gap-2 border-t border-border bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
                <Button variant="outline" size="sm">
                  <Edit3 className="h-3.5 w-3.5" /> Editar
                </Button>
                <Button size="sm" variant="default">
                  <Trash className="h-3.5 w-3.5" /> Eliminar
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
