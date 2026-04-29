import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'
import { portfolio } from '@/home/mocks/home.mock'

export const HomePortfolioSection = () => {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="flex items-end justify-between gap-6">
        <div>
          <Badge
            variant="outline"
            className="rounded-full border-border bg-brand-muted px-3 py-3 text-xs font-medium text-accent-foreground"
          >
            Portafolio
          </Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Trabajos recientes
          </h2>
        </div>
        <a
          href="#"
          className="hidden items-center gap-1 text-sm font-medium text-brand hover:underline sm:inline-flex"
        >
          Ver todos <ArrowRight className="h-4 w-4" />
        </a>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {portfolio.map((item) => (
          <figure
            key={item.label}
            className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-card"
          >
            <img
              src={item.src}
              alt={item.label}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5">
              <Badge className="bg-card/90 text-foreground backdrop-blur">
                {item.tag}
              </Badge>
              <figcaption className="mt-2 text-lg font-semibold text-white">
                {item.label}
              </figcaption>
            </div>
          </figure>
        ))}
      </div>
    </section>
  )
}
