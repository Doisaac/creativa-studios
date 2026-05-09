import { Link } from 'react-router'
import { Bell, Search, Plus, ChevronRight, Home } from 'lucide-react'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const AdminTopBar = ({
  title,
  breadcrumbs = [],
  primaryAction,
}: {
  title: string
  breadcrumbs?: { label: string; to?: string }[]
  primaryAction?: { label: string; onClick?: () => void }
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <SidebarTrigger className="-ml-1.5 h-8 w-8" />
        <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
          <Link
            to="/admin"
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
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar pedidos, clientes…"
              className="h-8 w-64 rounded-md bg-muted pl-8 text-xs"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </div>
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
            <Button size="sm" variant="default" onClick={primaryAction.onClick}>
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
  )
}
