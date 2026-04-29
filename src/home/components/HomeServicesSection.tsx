import { Badge } from '@/components/ui/badge'
import { services } from '@/home/pages/mocks/home.mock'

export const HomeServicesSection = () => {
  return (
    <section id="servicios" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="max-w-2xl">
        <Badge
          variant="outline"
          className="rounded-full border-border bg-brand-muted px-3 py-3 text-xs font-medium text-accent-foreground"
        >
          Servicios
        </Badge>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Todo lo que tu marca necesita, bajo un mismo techo.
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          Desde la idea hasta la pieza terminada. Diseñamos, producimos y
          entregamos.
        </p>
      </div>

      <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {services.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="group relative bg-card p-7 transition hover:bg-surface"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-muted text-accent-foreground transition group-hover:bg-brand group-hover:text-brand-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-base font-semibold text-foreground">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
