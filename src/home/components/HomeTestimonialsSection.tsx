import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Star } from 'lucide-react'
import { testimonials } from '@/home/mocks/home.mock'

export const HomeTestimonialsSection = () => {
  return (
    <section id="testimonios" className="bg-surface py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <Badge
            variant="outline"
            className="rounded-full border-border bg-card px-3 py-3 text-xs font-medium text-muted-foreground"
          >
            Testimonios
          </Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Lo que dicen nuestros clientes.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.name}
              className="gap-4 border-border bg-card p-6 shadow-soft"
            >
              <div className="flex gap-0.5 text-brand">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                &quot;{testimonial.text}&quot;
              </p>
              <div className="mt-2 flex items-center gap-3 border-t border-border pt-4">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-muted text-sm font-semibold text-accent-foreground">
                  {testimonial.name
                    .split(' ')
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
