import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'

import { Logo } from '@/components/custom/CustomLogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export const LoginPage = () => {
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => navigate('/admin'), 700)
  }

  return (
    <>
      {/* Left visual panel */}
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.74_0.16_60/0.25),transparent_50%),radial-gradient(circle_at_70%_80%,oklch(0.62_0.13_240/0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-grid-faint opacity-[0.07]" />

        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Logo className="text-primary-foreground [&_span]:text-primary-foreground" />

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground/60">
              Panel interno
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight">
              Gestiona pedidos, inventario y producción desde un solo lugar.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-primary-foreground/70">
              Sistema operativo de Creativa Studios — diseñado para que el
              equipo de recepción, producción e instaladores trabajen de forma
              sincronizada.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { v: '12', l: 'Pedidos hoy' },
                { v: '94%', l: 'Entregas a tiempo' },
                { v: '2.4k', l: 'Materiales' },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                >
                  <p className="text-xl font-semibold">{s.v}</p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-primary-foreground/60">
                    {s.l}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} Creativa Studios · Santa Ana, El
            Salvador
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex flex-col bg-background">
        <div className="flex items-center justify-between p-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al sitio
          </Link>
          <div className="lg:hidden">
            <Logo />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-semibold tracking-tight">
              Bienvenido de vuelta
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Ingresa con tu cuenta de empleado para continuar.
            </p>

            <Card className="mt-8 border-border bg-card p-7 shadow-soft">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Correo</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="empleado@creativastudios.sv"
                    defaultValue="admin@creativastudios.sv"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Contraseña</Label>
                    <a
                      href="#"
                      className="text-xs font-medium text-brand hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={show ? 'text' : 'password'}
                      placeholder="••••••••"
                      defaultValue="demo1234"
                      required
                    />
                    <button
                      type="button"
                      aria-label="Mostrar contraseña"
                      onClick={() => setShow((v) => !v)}
                      className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:bg-muted"
                    >
                      {show ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  variant="hero"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Ingresando…
                    </>
                  ) : (
                    'Iniciar sesión'
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Al continuar aceptas nuestras políticas internas de uso del
                  sistema.
                </p>
              </form>
            </Card>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              ¿Problemas para acceder? Contacta al administrador del sistema.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
