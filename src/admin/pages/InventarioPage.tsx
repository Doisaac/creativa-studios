import { useState } from 'react'
import {
  AlertTriangle,
  Boxes,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Filter,
  Search,
  Trash,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminTopBar } from '../components/AdminTopBar'
import { useInventario } from '../hooks/useInventario'
import type { InventarioItem } from '../types/inventario'

type Stock = 'En stock' | 'Bajo stock' | 'Agotado'

const stockColor: Record<Stock, string> = {
  'En stock': 'bg-success/10 text-success border border-success/20',
  'Bajo stock':
    'bg-warning/15 text-warning-foreground border border-warning/30',
  Agotado: 'bg-destructive/10 text-destructive border border-destructive/20',
}

const getStockStatus = (item: InventarioItem): Stock => {
  if (item.stock_actual <= 0) return 'Agotado'
  if (item.bajo_stock) return 'Bajo stock'

  return 'En stock'
}

const formatInventoryDate = (date: string) =>
  new Intl.DateTimeFormat('es-SV', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))

const InventoryTableSkeleton = () => (
  <div className="space-y-3 p-5">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="grid grid-cols-5 gap-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    ))}
  </div>
)

export const InventarioPage = () => {
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<InventarioItem | null>(null)
  const { data, error, isError, isFetching, isLoading, refetch } =
    useInventario({ page })

  const items = data?.items ?? []
  const pagination = data?.pagination
  const totalPages = pagination?.totalPages ?? 1
  const currentPage = pagination?.page ?? page
  const hasPagination = totalPages > 1
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  )

  const summary = {
    total: pagination?.total ?? items.length,
    inStock: items.filter((item) => getStockStatus(item) === 'En stock').length,
    lowStock: items.filter((item) => getStockStatus(item) === 'Bajo stock')
      .length,
    outOfStock: items.filter((item) => getStockStatus(item) === 'Agotado')
      .length,
  }

  return (
    <>
      <AdminTopBar
        title="Inventario"
        breadcrumbs={[{ label: 'Inventario' }]}
        primaryAction={{ label: 'Nuevo producto' }}
      />

      <div className="space-y-5 p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            {
              label: 'Total productos',
              value: summary.total.toString(),
              icon: Boxes,
              tint: 'bg-info/10 text-info',
            },
            {
              label: 'En stock',
              value: summary.inStock.toString(),
              icon: Boxes,
              tint: 'bg-success/10 text-success',
            },
            {
              label: 'Bajo stock',
              value: summary.lowStock.toString(),
              icon: AlertTriangle,
              tint: 'bg-warning/15 text-warning-foreground',
            },
            {
              label: 'Agotados',
              value: summary.outOfStock.toString(),
              icon: AlertTriangle,
              tint: 'bg-destructive/10 text-destructive',
            },
          ].map((item) => (
            <Card
              key={item.label}
              className="flex-row items-center gap-4 border-border bg-card p-4 shadow-soft"
            >
              <span
                className={`grid h-10 w-10 place-items-center rounded-lg ${item.tint}`}
              >
                <item.icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-2xl font-semibold tracking-tight">
                  {item.value}
                </p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="gap-0 overflow-hidden border-border bg-card p-0 shadow-soft">
          <div className="flex items-center justify-between border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar producto..."
                className="h-8 w-80 bg-muted pl-8 text-xs"
                disabled
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-3.5 w-3.5" /> Filtros
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-3.5 w-3.5" /> Exportar
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <InventoryTableSkeleton />
            ) : isError ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <div className="space-y-1">
                  <p className="font-medium">No se pudo cargar el inventario</p>
                  <p className="text-sm text-muted-foreground">
                    {error instanceof Error
                      ? error.message
                      : 'Ocurrió un error al consultar la API.'}
                  </p>
                </div>
                <Button size="sm" onClick={() => void refetch()}>
                  Reintentar
                </Button>
              </div>
            ) : items.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-2 p-6 text-center">
                <Boxes className="h-8 w-8 text-muted-foreground" />
                <p className="font-medium">No hay inventario registrado</p>
                <p className="text-sm text-muted-foreground">
                  Cuando existan productos, aparecerán listados aquí.
                </p>
              </div>
            ) : (
              <div className="relative">
                {isFetching ? (
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-border">
                    <div className="h-full w-full animate-pulse bg-primary/70" />
                  </div>
                ) : null}

                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/40 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 text-left">Producto</th>
                      <th className="px-5 py-3 text-left">Stock</th>
                      <th className="px-5 py-3 text-left">Mínimo</th>
                      <th className="px-5 py-3 text-left">Estado</th>
                      <th className="px-5 py-3 text-left">Unidad</th>
                      <th className="px-5 py-3 text-left">Creado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((item) => {
                      const status = getStockStatus(item)
                      const progress = Math.min(
                        100,
                        (item.stock_actual /
                          Math.max(item.stock_minimo * 2, 1)) *
                          100,
                      )

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelected(item)}
                          className="cursor-pointer transition hover:bg-muted/40"
                        >
                          <td className="px-5 py-3.5">
                            <p className="font-medium">{item.nombre}</p>
                            <p className="font-mono text-[11px] text-muted-foreground">
                              ID #{item.id}
                            </p>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold tabular-nums">
                                {item.stock_actual}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {item.unidad_de_medida}
                              </span>
                            </div>
                            <div className="mt-1.5 h-1 w-24 overflow-hidden rounded-full bg-muted">
                              <div
                                className={`h-full rounded-full ${status === 'Agotado' ? 'bg-destructive' : status === 'Bajo stock' ? 'bg-warning' : 'bg-success'}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground">
                            {item.stock_minimo}
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge
                              className={`${stockColor[status]} font-medium`}
                            >
                              {status}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground">
                            {item.unidad_de_medida}
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground">
                            {formatInventoryDate(item.created_at)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {pagination && items.length > 0 ? (
            <div className="flex flex-col gap-3 border-t border-border px-5 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>
                Página {currentPage} de {totalPages}
              </span>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <span>{pagination.total} registros en total</span>

                {hasPagination ? (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1 || isFetching}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>

                    {pageNumbers.map((pageNumber) => (
                      <Button
                        key={pageNumber}
                        variant={
                          pageNumber === currentPage ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => setPage(pageNumber)}
                        disabled={isFetching}
                        className="min-w-8"
                      >
                        {pageNumber}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages || isFetching}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      <Sheet
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <SheetContent className="w-full overflow-y-auto overflow-x-hidden sm:max-w-xl">
          {selected && (
            <>
              <SheetHeader className="border-b border-border pb-5">
                <Badge
                  className={`${stockColor[getStockStatus(selected)]} w-fit font-medium`}
                >
                  {getStockStatus(selected)}
                </Badge>
                <SheetTitle className="text-xl">{selected.nombre}</SheetTitle>
                <SheetDescription className="font-mono text-xs">
                  ID #{selected.id}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-5 py-6">
                <div className="rounded-xl border border-border bg-gradient-to-br from-card to-muted p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Stock actual
                  </p>
                  <p className="mt-1 text-4xl font-semibold tabular-nums">
                    {selected.stock_actual}{' '}
                    <span className="text-base font-normal text-muted-foreground">
                      {selected.unidad_de_medida}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Mínimo recomendado: {selected.stock_minimo}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Card className="gap-1 border-border bg-card p-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Boxes className="h-3 w-3" /> Unidad de medida
                    </div>
                    <p className="text-sm font-semibold">
                      {selected.unidad_de_medida}
                    </p>
                  </Card>
                  <Card className="gap-1 border-border bg-card p-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" /> Fecha de registro
                    </div>
                    <p className="text-sm font-semibold">
                      {formatInventoryDate(selected.created_at)}
                    </p>
                  </Card>
                </div>

                <Card className="gap-3 border-border bg-card p-4">
                  <h4 className="text-sm font-semibold">
                    Detalle del inventario
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">
                        Stock actual
                      </span>
                      <span className="font-medium tabular-nums">
                        {selected.stock_actual}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">
                        Stock mínimo
                      </span>
                      <span className="font-medium tabular-nums">
                        {selected.stock_minimo}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Bajo stock</span>
                      <span className="font-medium">
                        {selected.bajo_stock ? 'Sí' : 'No'}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="sticky bottom-0 -mx-4 flex w-full items-center justify-end gap-2 border-t border-border bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
                <Button variant="outline" size="sm">
                  <Edit3 className="h-3.5 w-3.5" /> Editar
                </Button>
                <Button size="sm" variant="default">
                  <Trash className="h-3.5 w-3.5" /> Eliminar
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
