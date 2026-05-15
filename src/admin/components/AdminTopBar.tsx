import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Bell, ChevronRight, Home, Plus, Search } from 'lucide-react'

import { useAuthStore } from '@/auth/store/authStore'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { SidebarTrigger } from '@/components/ui/sidebar'

interface SearchPage {
  label: string
  to: string
  keywords: string[]
  group: string
}

export const AdminTopBar = ({
  title,
  breadcrumbs = [],
  primaryAction,
}: {
  title: string
  breadcrumbs?: { label: string; to?: string }[]
  primaryAction?: { label: string; onClick?: () => void }
}) => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const user = useAuthStore((state) => state.user)
  const commandRef = useRef<HTMLInputElement>(null)
  const commandContainerRef = useRef<HTMLDivElement>(null)
  const [isCommandOpen, setIsCommandOpen] = useState(false)

  const isProduccion = user?.rol === 'PRODUCCION'
  const isInstalador = user?.rol === 'INSTALADOR'

  const availablePages = useMemo<SearchPage[]>(() => {
    const pages: SearchPage[] = [
      {
        label: 'Dashboard',
        to: '/admin',
        keywords: ['inicio', 'panel'],
        group: 'Operaciones',
      },
      {
        label: 'Clientes',
        to: '/admin/clientes',
        keywords: ['usuarios', 'contactos'],
        group: 'Operaciones',
      },
      {
        label: 'Pedidos',
        to: '/admin/pedidos',
        keywords: ['ordenes', 'ventas'],
        group: 'Operaciones',
      },
      {
        label: 'Mis instalaciones',
        to: '/admin/mis-instalaciones',
        keywords: ['instalaciones', 'asignaciones', 'agenda'],
        group: 'Operaciones',
      },
      {
        label: 'Inventario',
        to: '/admin/inventario',
        keywords: ['stock', 'insumos'],
        group: 'Gestion',
      },
      {
        label: 'Movimientos de inventario',
        to: '/admin/movimientos',
        keywords: ['movimientos', 'entradas', 'salidas', 'ajustes'],
        group: 'Gestion',
      },
      {
        label: 'Costos y precios',
        to: '/admin/costos',
        keywords: ['costos', 'precios', 'margenes'],
        group: 'Gestion',
      },
      {
        label: 'Productos',
        to: '/admin/productos',
        keywords: ['catalogo', 'articulos'],
        group: 'Gestion',
      },
    ]

    return pages.filter((page) => {
      if (isInstalador) return page.to === '/admin/mis-instalaciones'
      if (!isProduccion) return page.to !== '/admin/mis-instalaciones'

      return (
        page.to !== '/admin/mis-instalaciones' &&
        page.to !== '/admin/movimientos' &&
        page.to !== '/admin/costos'
      )
    })
  }, [isInstalador, isProduccion])

  const operationPages = useMemo(
    () => availablePages.filter((page) => page.group === 'Operaciones'),
    [availablePages],
  )

  const managementPages = useMemo(
    () => availablePages.filter((page) => page.group === 'Gestion'),
    [availablePages],
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        event.stopPropagation()
        setIsCommandOpen(true)

        requestAnimationFrame(() => {
          commandRef.current?.focus()
        })
        return
      }

      if (event.key === 'Escape') {
        setIsCommandOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsCommandOpen(false)
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [pathname])

  useEffect(() => {
    if (!isCommandOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!commandContainerRef.current?.contains(event.target as Node)) {
        setIsCommandOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [isCommandOpen])

  const handleSelectPage = (to: string) => {
    setIsCommandOpen(false)
    navigate(to)
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
          <SidebarTrigger className="-ml-1.5 h-8 w-8" />
          <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            <Link
              to={isInstalador ? '/admin/mis-instalaciones' : '/admin'}
              className="flex items-center gap-1 hover:text-foreground"
            >
              <Home className="h-3 w-3" /> Dashboard
            </Link>
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3" />
                {b.to ? (
                  <Link to={b.to} className="hover:text-foreground">
                    {b.label}
                  </Link>
                ) : (
                  <span className="font-medium text-foreground">{b.label}</span>
                )}
              </span>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsCommandOpen(true)

                requestAnimationFrame(() => {
                  commandRef.current?.focus()
                })
              }}
              className="hidden h-8 w-64 items-center rounded-md border border-input bg-muted px-2.5 text-xs text-muted-foreground shadow-xs transition-[color,box-shadow] outline-none hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:flex"
              aria-label="Abrir buscador de paginas"
            >
              <Search className="mr-2 h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                Buscar dashboard, clientes, pedidos...
              </span>
              <kbd className="ml-auto rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            </button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Notificaciones"
              className="relative"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand" />
            </Button>
            {primaryAction && (
              <Button
                size="sm"
                variant="default"
                onClick={primaryAction.onClick}
              >
                <Plus className="h-4 w-4" /> {primaryAction.label}
              </Button>
            )}
          </div>
        </div>
        <div className="px-4 pb-4 pt-1 sm:px-6">
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
            {title}
          </h1>
        </div>
      </header>

      {isCommandOpen ? (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
          <div className="flex min-h-full items-start justify-center px-4 pt-[12vh]">
            <div
              ref={commandContainerRef}
              className="w-full max-w-xl overflow-hidden rounded-xl border border-border bg-popover shadow-2xl"
            >
              <Command className="rounded-xl">
                <CommandInput
                  ref={commandRef}
                  placeholder="Buscar páginas..."
                />
                <CommandList>
                  <CommandEmpty>No se encontraron páginas.</CommandEmpty>
                  <CommandGroup heading="Operaciones">
                    {operationPages.map((page) => (
                      <CommandItem
                        key={page.to}
                        value={page.label}
                        keywords={page.keywords}
                        onSelect={() => handleSelectPage(page.to)}
                      >
                        {page.label}
                        <CommandShortcut>
                          {page.to.replace('/admin', '') || '/'}
                        </CommandShortcut>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {managementPages.length > 0 ? <CommandSeparator /> : null}
                  <CommandGroup heading="Gestion">
                    {managementPages.map((page) => (
                      <CommandItem
                        key={page.to}
                        value={page.label}
                        keywords={page.keywords}
                        onSelect={() => handleSelectPage(page.to)}
                      >
                        {page.label}
                        <CommandShortcut>
                          {page.to.replace('/admin', '') || '/'}
                        </CommandShortcut>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
