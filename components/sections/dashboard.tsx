"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Package, AlertTriangle } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { useDashboardStats } from "@/lib/supabase/hooks"
import { Spinner } from "@/components/ui/spinner"

export function Dashboard() {
  const { stats, revenueData, loading } = useDashboardStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    )
  }
  return (
    <div className="space-y-4 lg:space-y-6">
      <h1 className="text-2xl lg:text-3xl font-bold text-balance">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ventas del mes</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-card-foreground">${stats.salesLast30Days.toLocaleString("es-CL")} CLP</div>
            <p className="text-xs text-muted-foreground mt-1">Últimos 30 días</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ganancia neta</CardTitle>
            <TrendingUp className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-card-foreground">${stats.profitLast30Days.toLocaleString("es-CL")} CLP</div>
            <p className="text-xs text-muted-foreground mt-1">Últimos 30 días</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock total</CardTitle>
            <Package className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-card-foreground">{stats.totalStock}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.totalProducts} productos activos</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bajo stock</CardTitle>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-xl lg:text-2xl font-bold text-card-foreground">{stats.lowStockMaterials}</div>
            <p className="text-xs text-destructive mt-1">Materiales requieren reposición</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base lg:text-lg text-card-foreground">Ingresos vs Egresos (últimos 6 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueData.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] lg:h-[300px] text-muted-foreground">
                <p className="text-center px-4">
                  No hay datos de transacciones aún.
                  <br />
                  <span className="text-sm">Las ventas crean transacciones automáticamente.</span>
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickMargin={10}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickMargin={10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "#000000",
                    }}
                    labelStyle={{ color: "#000000" }}
                    itemStyle={{ color: "#000000" }}
                  />
                  <Legend wrapperStyle={{ fontSize: '14px' }} />
                  <Bar dataKey="ingresos" fill="#749c14" radius={[8, 8, 0, 0]} name="Ingresos" />
                  <Bar dataKey="egresos" fill="#b4de3d" radius={[8, 8, 0, 0]} name="Egresos" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
