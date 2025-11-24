"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Bar, BarChart } from "recharts"
import { supabase } from "@/lib/supabase/client"
import { Spinner } from "@/components/ui/spinner"

export function Reports() {
  const [selectedMonth, setSelectedMonth] = useState("6")
  const [selectedYear, setSelectedYear] = useState("2024")
  const [loading, setLoading] = useState(true)
  const [monthlySalesData, setMonthlySalesData] = useState<any[]>([])
  const [avgCostsData, setAvgCostsData] = useState<any[]>([])

  useEffect(() => {
    fetchReportData()
  }, [selectedMonth, selectedYear])

  async function fetchReportData() {
    try {
      setLoading(true)
      
      // Obtener ventas mensuales de los últimos 6 meses
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      
      const { data: sales } = await supabase
        .from('sales')
        .select('total_amount, profit, total_cost, sale_date')
        .gte('sale_date', sixMonthsAgo.toISOString().split('T')[0])
        .order('sale_date', { ascending: true })

      // Agrupar por mes
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      const monthlyData: Record<string, { ventas: number; gananciaReal: number; gananciaSugerida: number; count: number }> = {}
      
      sales?.forEach(sale => {
        const date = new Date(sale.sale_date)
        const monthKey = monthNames[date.getMonth()]
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { ventas: 0, gananciaReal: 0, gananciaSugerida: 0, count: 0 }
        }
        
        monthlyData[monthKey].ventas += sale.total_amount
        monthlyData[monthKey].gananciaReal += sale.profit
        // Sugerida es 30% sobre costo
        monthlyData[monthKey].gananciaSugerida += sale.total_cost * 0.3
        monthlyData[monthKey].count += 1
      })

      const chartData = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        ventas: Math.round(data.ventas),
        gananciaReal: Math.round(data.gananciaReal),
        gananciaSugerida: Math.round(data.gananciaSugerida)
      }))

      setMonthlySalesData(chartData)

      // Obtener datos de cotizaciones para costos promedio
      const { data: quotations } = await supabase
        .from('quotations')
        .select('material_cost, energy_cost, wear_cost, labor_cost')

      if (quotations && quotations.length > 0) {
        const totalQuotations = quotations.length
        const avgCosts = [
          { 
            category: "Material", 
            costo: Math.round(quotations.reduce((sum, q) => sum + q.material_cost, 0) / totalQuotations)
          },
          { 
            category: "Energía", 
            costo: Math.round(quotations.reduce((sum, q) => sum + q.energy_cost, 0) / totalQuotations)
          },
          { 
            category: "Desgaste", 
            costo: Math.round(quotations.reduce((sum, q) => sum + q.wear_cost, 0) / totalQuotations)
          },
          { 
            category: "Mano de obra", 
            costo: Math.round(quotations.reduce((sum, q) => sum + q.labor_cost, 0) / totalQuotations)
          }
        ]
        setAvgCostsData(avgCosts)
      }
    } catch (err) {
      console.error('Error fetching report data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-balance">Reportes</h1>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="month" className="text-card-foreground">
                Mes
              </Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="bg-secondary border-border text-secondary-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="1">Enero</SelectItem>
                  <SelectItem value="2">Febrero</SelectItem>
                  <SelectItem value="3">Marzo</SelectItem>
                  <SelectItem value="4">Abril</SelectItem>
                  <SelectItem value="5">Mayo</SelectItem>
                  <SelectItem value="6">Junio</SelectItem>
                  <SelectItem value="7">Julio</SelectItem>
                  <SelectItem value="8">Agosto</SelectItem>
                  <SelectItem value="9">Septiembre</SelectItem>
                  <SelectItem value="10">Octubre</SelectItem>
                  <SelectItem value="11">Noviembre</SelectItem>
                  <SelectItem value="12">Diciembre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="year" className="text-card-foreground">
                Año
              </Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="bg-secondary border-border text-secondary-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Evolución de ventas mensuales (CLP)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySalesData}>
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "#000000",
                }}
                labelStyle={{ color: "#000000" }}
                itemStyle={{ color: "#000000" }}
                formatter={(value: number) => `$${value.toLocaleString("es-CL")} CLP`}
              />
              <Legend />
              <Line type="monotone" dataKey="ventas" stroke="#749c14" strokeWidth={2} name="Ventas" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Ganancia real vs sugerida (CLP)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlySalesData}>
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "#000000",
                }}
                labelStyle={{ color: "#000000" }}
                itemStyle={{ color: "#000000" }}
                formatter={(value: number) => `$${value.toLocaleString("es-CL")} CLP`}
              />
              <Legend />
              <Bar dataKey="gananciaReal" fill="#749c14" radius={[8, 8, 0, 0]} name="Ganancia Real" />
              <Bar dataKey="gananciaSugerida" fill="#b4de3d" radius={[8, 8, 0, 0]} name="Ganancia Sugerida" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Costos promedio por categoría (CLP)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={avgCostsData} layout="vertical">
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="category" type="category" stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "#000000",
                }}
                labelStyle={{ color: "#000000" }}
                itemStyle={{ color: "#000000" }}
                formatter={(value: number) => `$${value.toLocaleString("es-CL")} CLP`}
              />
              <Bar dataKey="costo" fill="#94c11e" radius={[0, 8, 8, 0]} name="Costo Promedio" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
