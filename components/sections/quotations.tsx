"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Package } from "lucide-react"
import { useMachines } from "@/lib/supabase/hooks"
import { supabase } from "@/lib/supabase/client"
import { Spinner } from "@/components/ui/spinner"

interface QuotationResult {
  materialCost: number
  energyCost: number
  wearCost: number
  laborCost: number
  subtotal: number
  iva: number
  margin: number
  finalPrice: number
}

export function Quotations() {
  const { machines, loading: machinesLoading } = useMachines()
  const [formData, setFormData] = useState({
    productName: "",
    weight: "",
    printHours: "0",
    printMinutes: "0",
    rollWeight: "",
    rollCost: "",
    materialCostPerGram: "",
    machineId: "",
    machinePower: "150",
    energyCostPerKwh: "140",
    wearCostPerHour: "200",
    laborCostPerHour: "100",
    iva: "19",
    margin: "300",
  })

  const [result, setResult] = useState<QuotationResult | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleMachineChange = (machineId: string) => {
    const machine = machines.find(m => m.id === machineId)
    if (machine) {
      setFormData({
        ...formData,
        machineId,
        machinePower: machine.power_consumption_watts.toString()
      })
    }
  }

  const handleSaveAsProduct = async () => {
    if (!result || !formData.productName) {
      alert("Por favor, ingrese un nombre de producto y calcule la cotización primero")
      return
    }

    setSubmitting(true)
    try {
      // Verificar sesión primero
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
        window.location.href = '/login'
        return
      }
      
      // 1. Guardar la cotización
      const { data: quotationData, error: quotationError } = await supabase
        .from("quotations")
        .insert({
          product_name: formData.productName,
          weight_grams: Number.parseFloat(formData.weight),
          print_time_hours: Number.parseInt(formData.printHours),
          print_time_minutes: Number.parseInt(formData.printMinutes),
          material_cost_per_gram: Number.parseFloat(formData.materialCostPerGram),
          energy_cost_per_kwh: Number.parseFloat(formData.energyCostPerKwh),
          wear_cost_per_hour: Number.parseFloat(formData.wearCostPerHour),
          labor_cost_per_hour: Number.parseFloat(formData.laborCostPerHour),
          iva_percentage: Number.parseFloat(formData.iva),
          margin_percentage: Number.parseFloat(formData.margin),
          material_cost: result.materialCost,
          energy_cost: result.energyCost,
          wear_cost: result.wearCost,
          labor_cost: result.laborCost,
          subtotal: result.subtotal,
          iva_amount: result.iva,
          margin_amount: result.margin,
          final_price: result.finalPrice,
          machine_id: formData.machineId || null,
          created_by: session.user.id
        })
        .select()
        .single()

      if (quotationError) throw quotationError

      // 2. Crear el producto vinculado a la cotización
      const { error: productError } = await supabase
        .from("products")
        .insert({
          name: formData.productName,
          total_cost: result.subtotal,
          suggested_price: result.finalPrice,
          stock: 0,
          quotation_id: quotationData.id,
          created_by: session.user.id
        })

      if (productError) throw productError

      alert(`Producto "${formData.productName}" guardado exitosamente con precio sugerido de $${result.finalPrice.toLocaleString("es-CL")} CLP`)

      // Reset form
      setFormData({
        productName: "",
        weight: "",
        printHours: "0",
        printMinutes: "0",
        rollWeight: "",
        rollCost: "",
        materialCostPerGram: "",
        machineId: "",
        machinePower: "150",
        energyCostPerKwh: "140",
        wearCostPerHour: "200",
        laborCostPerHour: "100",
        iva: "19",
        margin: "300",
      })
      setResult(null)
    } catch (err: any) {
      alert(`Error al guardar producto: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRollWeightChange = (value: string) => {
    setFormData({ ...formData, rollWeight: value })
    if (value && formData.rollCost) {
      const costPerGram = Number.parseFloat(formData.rollCost) / Number.parseFloat(value)
      setFormData((prev) => ({ ...prev, rollWeight: value, materialCostPerGram: costPerGram.toFixed(4) }))
    }
  }

  const handleRollCostChange = (value: string) => {
    setFormData({ ...formData, rollCost: value })
    if (value && formData.rollWeight) {
      const costPerGram = Number.parseFloat(value) / Number.parseFloat(formData.rollWeight)
      setFormData((prev) => ({ ...prev, rollCost: value, materialCostPerGram: costPerGram.toFixed(4) }))
    }
  }

  const calculateQuotation = () => {
    const weight = Number.parseFloat(formData.weight) || 0
    const hours = Number.parseFloat(formData.printHours) || 0
    const minutes = Number.parseFloat(formData.printMinutes) || 0
    const printTimeInHours = hours + minutes / 60

    const materialCostPerGram = Number.parseFloat(formData.materialCostPerGram) || 0
    const machinePowerW = Number.parseFloat(formData.machinePower) || 0
    const machinePowerKw = machinePowerW / 1000
    const energyCostPerKwh = Number.parseFloat(formData.energyCostPerKwh) || 0
    const wearCostPerHour = Number.parseFloat(formData.wearCostPerHour) || 0
    const laborCostPerHour = Number.parseFloat(formData.laborCostPerHour) || 0
    const ivaPercent = Number.parseFloat(formData.iva) || 0
    const marginPercent = Number.parseFloat(formData.margin) || 0

    const materialCost = Math.ceil(weight * materialCostPerGram)
    const energyCost = Math.ceil(printTimeInHours * machinePowerKw * energyCostPerKwh)
    const wearCost = Math.ceil(printTimeInHours * wearCostPerHour)
    const laborCost = Math.ceil(printTimeInHours * laborCostPerHour)

    const subtotal = materialCost + energyCost + wearCost + laborCost
    const margin = Math.ceil(subtotal * (marginPercent / 100))
    const totalNeto = subtotal + margin
    const iva = Math.ceil(totalNeto * (ivaPercent / 100))
    const finalPrice = totalNeto + iva

    setResult({
      materialCost,
      energyCost,
      wearCost,
      laborCost,
      subtotal,
      iva,
      margin,
      finalPrice,
    })
  }

  if (machinesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl lg:text-3xl font-bold">Cotizador de productos</h1>
      </div>

      <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <Calculator className="w-5 h-5" />
              Datos del producto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="productName">Nombre del producto</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                placeholder="Ej: Figura decorativa"
              />
            </div>

            <div>
              <Label htmlFor="machine">Máquina</Label>
              <Select value={formData.machineId} onValueChange={handleMachineChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una máquina" />
                </SelectTrigger>
                <SelectContent>
                  {machines.map((machine) => (
                    <SelectItem key={machine.id} value={machine.id}>
                      {machine.name} ({machine.power_consumption_watts}W)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="weight">Peso del producto (g)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="printHours">Tiempo de impresión (horas)</Label>
                <Input
                  id="printHours"
                  type="number"
                  value={formData.printHours}
                  onChange={(e) => setFormData({ ...formData, printHours: e.target.value })}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="printMinutes">Minutos</Label>
                <Input
                  id="printMinutes"
                  type="number"
                  value={formData.printMinutes}
                  onChange={(e) => setFormData({ ...formData, printMinutes: e.target.value })}
                  min="0"
                  max="59"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Costo de material</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rollWeight">Peso rollo (g)</Label>
                  <Input
                    id="rollWeight"
                    type="number"
                    value={formData.rollWeight}
                    onChange={(e) => handleRollWeightChange(e.target.value)}
                    placeholder="1000"
                  />
                </div>
                <div>
                  <Label htmlFor="rollCost">Costo rollo (CLP)</Label>
                  <Input
                    id="rollCost"
                    type="number"
                    value={formData.rollCost}
                    onChange={(e) => handleRollCostChange(e.target.value)}
                    placeholder="25000"
                  />
                </div>
              </div>
              <div className="mt-3">
                <Label htmlFor="materialCostPerGram">Costo por gramo (CLP)</Label>
                <Input
                  id="materialCostPerGram"
                  type="number"
                  step="0.0001"
                  value={formData.materialCostPerGram}
                  onChange={(e) => setFormData({ ...formData, materialCostPerGram: e.target.value })}
                  placeholder="0.025"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Costos operacionales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="machinePower">Potencia máquina (W)</Label>
              <Input
                id="machinePower"
                type="number"
                value={formData.machinePower}
                onChange={(e) => setFormData({ ...formData, machinePower: e.target.value })}
                disabled={!!formData.machineId}
              />
            </div>

            <div>
              <Label htmlFor="energyCostPerKwh">Costo energía por kWh (CLP)</Label>
              <Input
                id="energyCostPerKwh"
                type="number"
                value={formData.energyCostPerKwh}
                onChange={(e) => setFormData({ ...formData, energyCostPerKwh: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="wearCostPerHour">Costo desgaste por hora (CLP)</Label>
              <Input
                id="wearCostPerHour"
                type="number"
                value={formData.wearCostPerHour}
                onChange={(e) => setFormData({ ...formData, wearCostPerHour: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="laborCostPerHour">Costo mano de obra por hora (CLP)</Label>
              <Input
                id="laborCostPerHour"
                type="number"
                value={formData.laborCostPerHour}
                onChange={(e) => setFormData({ ...formData, laborCostPerHour: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="iva">IVA (%)</Label>
                <Input
                  id="iva"
                  type="number"
                  value={formData.iva}
                  onChange={(e) => setFormData({ ...formData, iva: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="margin">Margen (%)</Label>
                <Input
                  id="margin"
                  type="number"
                  value={formData.margin}
                  onChange={(e) => setFormData({ ...formData, margin: e.target.value })}
                />
              </div>
            </div>

            <Button onClick={calculateQuotation} className="w-full">
              <Calculator className="w-4 h-4 mr-2" />
              Calcular cotización
            </Button>
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Resultado de la cotización</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Costo material:</span>
                <span className="font-semibold">${result.materialCost.toLocaleString("es-CL")} CLP</span>
              </div>
              <div className="flex justify-between">
                <span>Costo energía:</span>
                <span className="font-semibold">${result.energyCost.toLocaleString("es-CL")} CLP</span>
              </div>
              <div className="flex justify-between">
                <span>Costo desgaste:</span>
                <span className="font-semibold">${result.wearCost.toLocaleString("es-CL")} CLP</span>
              </div>
              <div className="flex justify-between">
                <span>Costo mano de obra:</span>
                <span className="font-semibold">${result.laborCost.toLocaleString("es-CL")} CLP</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-semibold">Subtotal (Costo):</span>
                <span className="font-semibold">${result.subtotal.toLocaleString("es-CL")} CLP</span>
              </div>
              <div className="flex justify-between text-accent">
                <span>Margen ({formData.margin}%):</span>
                <span className="font-semibold">${result.margin.toLocaleString("es-CL")} CLP</span>
              </div>
              <div className="flex justify-between">
                <span>IVA ({formData.iva}%):</span>
                <span className="font-semibold">${result.iva.toLocaleString("es-CL")} CLP</span>
              </div>
              <div className="border-t-2 pt-3 flex justify-between text-lg">
                <span className="font-bold">Precio Final:</span>
                <span className="font-bold text-primary">${result.finalPrice.toLocaleString("es-CL")} CLP</span>
              </div>
            </div>

            <Button onClick={handleSaveAsProduct} className="w-full mt-6" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2" />
                  Guardar como producto
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
