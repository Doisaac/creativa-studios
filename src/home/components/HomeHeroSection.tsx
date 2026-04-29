import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { partners } from '@/home/mocks/home.mock'
import heroImg from '@/assets/hero-mockups.jpg'

export const HomeHeroSection = () => {
  return (
    <section id="inicio" className="relative overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 bg-grid-faint opacity-60 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-16 sm:px-8 lg:grid-cols-12 lg:pt-24">
        <div className="lg:col-span-6">
          <Badge
            variant="outline"
            className="mb-5 gap-1.5 rounded-full border-border-strong bg-card px-3 py-4 text-xs font-medium text-muted-foreground"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Creativa Studios · Santa Ana, El Salvador
          </Badge>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">
            Digitalizamos y potenciamos tus{' '}
            <span className="text-gradient-brand">soluciones creativas</span>.
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Impresión, diseño, publicidad y soluciones visuales para hacer
            crecer tu negocio. Producimos cada pieza con cuidado y entregamos a
            tiempo.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" variant="hero" asChild>
              <a href="#contacto">
                Solicitar cotización <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#servicios">Ver servicios</a>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" /> Entregas
              puntuales
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" /> Calidad
              profesional
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" /> Atención
              personalizada
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-brand/30 via-transparent to-transparent blur-2xl" />

            <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-floating">
              <img
                src={heroImg}
                alt="Mockups de impresos, branding y promocionales de Creativa Studios"
                width={1536}
                height={1152}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>

            <Card className="absolute -bottom-6 -left-6 hidden w-72 gap-0 border-border bg-card/95 p-4 shadow-floating backdrop-blur sm:block">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-success/10 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Clientes satisfechos
                  </p>

                  <p className="text-sm font-semibold">
                    +500 proyectos realizados
                  </p>
                </div>
              </div>
            </Card>

            <Card className="absolute -right-4 top-8 hidden w-64 gap-0 border-border bg-card/95 p-4 shadow-floating backdrop-blur sm:block">
              <p className="text-xs text-muted-foreground">
                Servicios destacados
              </p>

              <p className="mt-1 text-sm font-semibold">
                Branding · Viniles · Impresión
              </p>
            </Card>
          </div>
        </div>
      </div>

      <div className="border-y border-border bg-background/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
          <div className="flex items-center gap-10">
            <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              +500 marcas confían en nosotros
            </span>

            <div className="flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
              <div className="marquee flex min-w-max gap-12">
                {[...partners, ...partners].map((partner, index) => (
                  <span
                    key={`${partner}-${index}`}
                    className="shrink-0 text-sm font-semibold text-foreground/40"
                  >
                    {partner}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
