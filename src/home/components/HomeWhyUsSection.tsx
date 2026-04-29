import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { benefits } from '@/home/mocks/home.mock'

export const HomeWhyUsSection = () => {
  return (
    <section id="por-que" className="bg-surface py-24">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Badge
            variant="outline"
            className="rounded-full border-border bg-card px-3 py-3 text-xs font-medium text-muted-foreground"
          >
            Por qué nosotros
          </Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Operamos como un estudio. Pensamos como un negocio.
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            No solo imprimimos. Manejamos cada proyecto con un sistema de
            control interno que asegura calidad, tiempos y materiales. Por eso
            nuestros clientes vuelven.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { v: '+500', l: 'Clientes' },
              { v: '+1,000', l: 'Proyectos' },
              { v: '8', l: 'Años de experiencia' },
            ].map((stat) => (
              <div
                key={stat.l}
                className="rounded-xl border border-border bg-card p-5"
              >
                <p className="text-2xl font-semibold text-foreground sm:text-3xl">
                  {stat.v}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.l}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
          {benefits.map(({ icon: Icon, title, desc }) => (
            <Card
              key={title}
              className="gap-3 border-border bg-card p-6 shadow-soft transition hover:shadow-elevated"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="mt-2 text-base font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
