import { Logo } from '@/components/custom/CustomLogo'
import { FacebookIcon, InstagramIcon } from '@/components/custom/icons'
import { MapPin, Mail, Phone } from 'lucide-react'

export const HomeFooter = () => {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Estudio creativo de diseño, impresión y publicidad en Santa Ana, El
            Salvador. Damos forma a marcas y proyectos con piezas hechas con
            cuidado.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a
              href="https://www.instagram.com/digitalsolutions.esa?igsh=MWJyM2J5Yjh2cHRpNA=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="grid h-9 w-9 place-items-center rounded-md border border-border bg-card text-muted-foreground transition hover:border-brand hover:text-brand"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a
              href="https://www.facebook.com/share/1NUJXb2HVv/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="grid h-9 w-9 place-items-center rounded-md border border-border bg-card text-muted-foreground transition hover:border-brand hover:text-brand"
            >
              <FacebookIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Servicios
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              'Diseño gráfico',
              'Impresiones',
              'Viniles & rotulación',
              'Sublimación',
              'Vallas publicitarias',
              'Branding',
            ].map((s) => (
              <li key={s}>
                <a
                  href="#servicios"
                  className="text-foreground/80 hover:text-brand"
                >
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Empresa
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a
                href="#por-que"
                className="text-foreground/80 hover:text-brand"
              >
                Por qué nosotros
              </a>
            </li>
            <li>
              <a
                href="#testimonios"
                className="text-foreground/80 hover:text-brand"
              >
                Testimonios
              </a>
            </li>
            <li>
              <a
                href="#ubicacion"
                className="text-foreground/80 hover:text-brand"
              >
                Ubicación
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Contacto
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-foreground/80">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-brand" /> Av. Independencia Sur, Santa Ana, El Salvador
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-brand" /> +503 7000 0000
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-brand" /> hola@creativastudios.sv
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-8">
          <p>
            © {new Date().getFullYear()} Creativa Studios. Todos los derechos
            reservados.
          </p>
          <p>Hecho con cuidado en Santa Ana 🇸🇻</p>
        </div>
      </div>
    </footer>
  )
}
