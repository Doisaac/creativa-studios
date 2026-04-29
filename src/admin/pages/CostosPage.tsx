import { AdminTopBar } from '../components/AdminTopBar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TrendingUp, Percent, DollarSign, Search } from 'lucide-react'

const products = [
  {
    name: 'Tarjeta presentación 300g',
    baseCost: 0.04,
    margin: 65,
    suggested: 0.11,
  },
  { name: 'Vinil corte por metro', baseCost: 1.85, margin: 55, suggested: 4.1 },
  { name: 'Banner lona 13oz / m²', baseCost: 2.2, margin: 60, suggested: 5.5 },
  { name: 'Camisa sublimada', baseCost: 4.5, margin: 50, suggested: 9.0 },
  { name: 'Taza sublimada 11oz', baseCost: 1.8, margin: 70, suggested: 6.0 },
  {
    name: 'Sticker troquelado pequeño',
    baseCost: 0.12,
    margin: 75,
    suggested: 0.48,
  },
  {
    name: 'Brochure A4 plegado 4x4',
    baseCost: 0.18,
    margin: 60,
    suggested: 0.45,
  },
]

export const CostosPage = () => {
  return (
    <>
      <AdminTopBar
        title="Costos y precios"
        breadcrumbs={[{ label: 'Costos y precios' }]}
        primaryAction={{ label: 'Nuevo cálculo' }}
      />
      <div className="space-y-5 p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              l: 'Margen promedio',
              v: '62%',
              icon: Percent,
              tint: 'bg-success/10 text-success',
            },
            {
              l: 'Productos calculados',
              v: products.length.toString(),
              icon: DollarSign,
              tint: 'bg-info/10 text-info',
            },
            {
              l: 'Variación vs mes anterior',
              v: '+4.2%',
              icon: TrendingUp,
              tint: 'bg-brand-muted text-accent-foreground',
            },
          ].map((s) => (
            <Card
              key={s.l}
              className="flex-row items-center gap-4 border-border bg-card p-5 shadow-soft"
            >
              <span
                className={`grid h-10 w-10 place-items-center rounded-lg ${s.tint}`}
              >
                <s.icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-2xl font-semibold tracking-tight">{s.v}</p>
                <p className="text-xs text-muted-foreground">{s.l}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="gap-0 overflow-hidden border-border bg-card p-0 shadow-soft">
          <div className="flex items-center justify-between border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar producto…"
                className="h-8 w-72 bg-muted pl-8 text-xs"
              />
            </div>
            <Button variant="outline" size="sm">
              Recalcular todos
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left">Producto</th>
                  <th className="px-5 py-3 text-right">Costo base</th>
                  <th className="px-5 py-3 text-right">Margen</th>
                  <th className="px-5 py-3 text-right">Precio sugerido</th>
                  <th className="px-5 py-3 text-right">Ganancia</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => {
                  const gain = p.suggested - p.baseCost
                  return (
                    <tr key={p.name} className="transition hover:bg-muted/40">
                      <td className="px-5 py-3.5 font-medium">{p.name}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-muted-foreground">
                        ${p.baseCost.toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Badge className="bg-brand-muted text-accent-foreground font-semibold">
                          {p.margin}%
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold tabular-nums">
                        ${p.suggested.toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-success">
                        +${gain.toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button variant="ghost" size="sm">
                          Ajustar
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  )
}
