"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useSales } from "@/lib/supabase/hooks"
import { Spinner } from "@/components/ui/spinner"
import { TrendingUp, TrendingDown } from "lucide-react"

export function Sales() {
  const { sales, loading } = useSales()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl lg:text-3xl font-bold text-balance">Historial de Ventas</h1>
      </div>

      {sales.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center px-4">
              No hay ventas registradas aún.
              <br />
              Las ventas se registran desde la sección <strong>Productos</strong>.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base lg:text-lg text-card-foreground">Historial de ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-6 px-6 lg:mx-0 lg:px-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-muted/50">
                    <TableHead className="text-muted-foreground min-w-[150px]">Producto</TableHead>
                    <TableHead className="text-muted-foreground min-w-20">Cantidad</TableHead>
                    <TableHead className="text-muted-foreground min-w-[130px]">Precio unitario</TableHead>
                    <TableHead className="text-muted-foreground min-w-[120px]">Total venta</TableHead>
                    <TableHead className="text-muted-foreground min-w-[120px]">Ganancia</TableHead>
                    <TableHead className="text-muted-foreground min-w-[100px]">Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id} className="border-border hover:bg-muted/50">
                      <TableCell className="font-medium text-card-foreground">{sale.product_name}</TableCell>
                      <TableCell className="text-card-foreground">{sale.quantity}</TableCell>
                      <TableCell className="text-card-foreground">${sale.price_per_unit.toLocaleString("es-CL")} CLP</TableCell>
                      <TableCell className="text-card-foreground font-semibold">${sale.total_amount.toLocaleString("es-CL")} CLP</TableCell>
                      <TableCell className="text-accent font-semibold">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 shrink-0" />
                          <span className="whitespace-nowrap">${sale.profit.toLocaleString("es-CL")} CLP</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-card-foreground">{new Date(sale.sale_date).toLocaleDateString('es-CL')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
