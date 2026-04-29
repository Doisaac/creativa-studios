import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Clock, Layers, MapPin, Phone } from 'lucide-react'

export const HomeLocationSection = () => {
  return (
    <section id="ubicacion" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Badge
            variant="outline"
            className="rounded-full border-border bg-brand-muted px-3 py-3 text-xs font-medium text-accent-foreground"
          >
            Ubicación
          </Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Visítanos en Santa Ana Centro.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Te esperamos para conversar tu próximo proyecto.
          </p>

          <Card className="mt-8 gap-0 divide-y divide-border border-border bg-card p-0 shadow-soft">
            {[
              {
                icon: MapPin,
                label: 'Dirección',
                value: 'Santa Ana Centro, El Salvador',
              },
              {
                icon: Clock,
                label: 'Horario',
                value: 'Lun – Vie · 8:00 a.m. – 6:00 p.m. · Sáb 8:00 – 1:00',
              },
              { icon: Phone, label: 'Teléfono', value: '+503 7000 0000' },
              { icon: Layers, label: 'Redes', value: '@creativastudios.sv' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4 p-5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-muted text-accent-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </Card>

          <div id="contacto" className="mt-6 flex gap-3">
            <Button size="lg" variant="hero" className="flex-1">
              Solicitar cotización
            </Button>
            <Button size="lg" variant="outline">
              Llamar
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft lg:col-span-7">
          <iframe
            title="Ubicación Creativa Studios"
            src="https://www.google.com/maps?q=Santa+Ana+Centro,+El+Salvador&output=embed"
            loading="lazy"
            className="h-full min-h-[480px] w-full"
          />
        </div>
      </div>
    </section>
  )
}
