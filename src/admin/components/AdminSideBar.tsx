import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  Box,
  ClipboardList,
  Users,
  DollarSign,
  Sparkles,
  ChevronsUpDown,
} from 'lucide-react'
import { Logo } from '@/components/custom/CustomLogo'
import { Badge } from '@/components/ui/badge'
import { Link, useLocation } from 'react-router'

interface MenuItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  exact?: boolean
  badge?: string
}

interface MenuGroup {
  label: string
  items: MenuItem[]
}

const groups: MenuGroup[] = [
  {
    label: 'Operaciones',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      {
        to: '/admin/pedidos',
        label: 'Pedidos',
        icon: ShoppingBag,
        badge: '12',
      },
      { to: '/admin/clientes', label: 'Clientes', icon: Users },
    ],
  },
  {
    label: 'Gestión',
    items: [
      { to: '/admin/inventario', label: 'Inventario', icon: Boxes },
      { to: '/admin/productos', label: 'Productos', icon: Box },
      {
        to: '/admin/movimientos',
        label: 'Movimientos de Inventario',
        icon: ClipboardList,
      },
      { to: '/admin/costos', label: 'Costos y precios', icon: DollarSign },
    ],
  },
]

export const AdminSidebar = () => {
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'
  const { pathname } = useLocation()

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + '/')

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3.5">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <Logo />
            <Badge
              variant="outline"
              className="border-border bg-card text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
            >
              Admin
            </Badge>
          </div>
        ) : (
          <Link
            to="/admin"
            className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground"
          >
            <Sparkles className="h-4 w-4" />
          </Link>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        {groups.map((g) => (
          <SidebarGroup key={g.label} className="px-1">
            {!collapsed && (
              <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                {g.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => {
                  const active = isActive(item.to, item.exact)
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className="group h-9 rounded-md px-2.5 text-[13.5px] font-medium text-sidebar-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-soft"
                      >
                        <Link
                          to={item.to}
                          className="flex items-center gap-2.5"
                        >
                          <item.icon
                            className={`h-4 w-4 shrink-0 ${active ? 'text-brand' : 'text-muted-foreground group-hover:text-foreground'}`}
                          />
                          {!collapsed && (
                            <>
                              <span className="flex-1 truncate">
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className="rounded-md bg-brand/15 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        {!collapsed ? (
          <button className="flex w-full items-center gap-2.5 rounded-md p-2 text-left transition hover:bg-sidebar-accent">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-brand text-brand-foreground text-xs font-semibold">
              JM
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-[13px] font-semibold text-sidebar-foreground">
                Douglas Barrera
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                Administrador
              </p>
            </div>
            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        ) : (
          <div className="grid h-8 w-8 place-items-center rounded-md bg-brand text-brand-foreground text-xs font-semibold">
            JM
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
