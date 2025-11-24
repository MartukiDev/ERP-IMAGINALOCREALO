"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useMaterials } from "@/lib/supabase/hooks"
import { supabase } from "@/lib/supabase/client"
import { Spinner } from "@/components/ui/spinner"

export function MaterialInventory() {
  const { materials, loading, error, refetch } = useMaterials()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    quantity: "",
    unitCost: "",
    unit: "g",
    purchaseDate: "",
  })

  const handleAddMaterial = async () => {
    if (!formData.name || !formData.type || !formData.quantity || !formData.unitCost || !formData.purchaseDate) {
      alert("Por favor completa todos los campos")
      return
    }

    setSubmitting(true)
    try {
      if (isEditMode && editingMaterialId) {
        const { error } = await supabase
          .from('materials')
          .update({
            name: formData.name,
            type: formData.type,
            quantity: Number.parseFloat(formData.quantity),
            unit_cost: Number.parseFloat(formData.unitCost),
            unit: formData.unit,
            purchase_date: formData.purchaseDate,
          })
          .eq('id', editingMaterialId)

        if (error) throw error
        
        setIsEditMode(false)
        setEditingMaterialId(null)
      } else {
        // Verificar sesión primero
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
          window.location.href = '/login'
          return
        }
        
        const { error } = await supabase
          .from('materials')
          // @ts-ignore - Type error due to incomplete type generation
          .insert({
            name: formData.name,
            type: formData.type,
            quantity: Number.parseFloat(formData.quantity),
            unit_cost: Number.parseFloat(formData.unitCost),
            unit: formData.unit,
            purchase_date: formData.purchaseDate,
            created_by: session.user.id
          })

        if (error) throw error
      }

      setIsDialogOpen(false)
      setFormData({ name: "", type: "", quantity: "", unitCost: "", unit: "g", purchaseDate: "" })
      await refetch()
    } catch (err: any) {
      alert(`Error al guardar material: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditMaterial = (material: any) => {
    setIsEditMode(true)
    setEditingMaterialId(material.id)
    setFormData({
      name: material.name,
      type: material.type,
      quantity: material.quantity.toString(),
      unitCost: material.unit_cost.toString(),
      unit: material.unit,
      purchaseDate: material.purchase_date,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este material?")) return

    try {
      // @ts-ignore - status field exists in DB but not in generated types
      const { error } = await supabase
        .from('materials')
        .update({ status: 'inactive' })
        .eq('id', id)

      if (error) throw error
      
      await refetch()
    } catch (err: any) {
      alert(`Error al eliminar material: ${err.message}`)
    }
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setIsEditMode(false)
      setEditingMaterialId(null)
      setFormData({ name: "", type: "", quantity: "", unitCost: "", unit: "g", purchaseDate: "" })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-accent text-accent-foreground">Activo</Badge>
      case "low":
        return <Badge className="bg-destructive/20 text-destructive">Bajo stock</Badge>
      case "out":
        return <Badge variant="destructive">Agotado</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="text-muted-foreground">Cargando materiales...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">Error: {error}</p>
          <Button onClick={refetch}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold">Inventario de materiales</h1>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Agregar material
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-[95vw] sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {isEditMode ? "Editar material" : "Nuevo material"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="Ej: Filamento, Resina"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unidad</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">Gramos (g)</SelectItem>
                      <SelectItem value="kg">Kilogramos (kg)</SelectItem>
                      <SelectItem value="ml">Mililitros (ml)</SelectItem>
                      <SelectItem value="l">Litros (l)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="unitCost">Costo unitario (CLP)</Label>
                <Input
                  id="unitCost"
                  type="number"
                  step="0.01"
                  value={formData.unitCost}
                  onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="purchaseDate">Fecha de compra</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                />
              </div>
              <Button
                onClick={handleAddMaterial}
                className="w-full"
                disabled={submitting}
              >
                {submitting ? "Guardando..." : isEditMode ? "Actualizar" : "Agregar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base lg:text-lg">Stock de materiales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6 lg:mx-0 lg:px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Nombre</TableHead>
                  <TableHead className="min-w-[120px]">Tipo</TableHead>
                  <TableHead className="min-w-[100px]">Cantidad</TableHead>
                  <TableHead className="min-w-[120px]">Costo unitario</TableHead>
                  <TableHead className="min-w-[100px]">Estado</TableHead>
                  <TableHead className="min-w-[120px]">Fecha de compra</TableHead>
                  <TableHead className="min-w-[120px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No hay materiales registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  materials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.name}</TableCell>
                      <TableCell>{material.type}</TableCell>
                      <TableCell>
                        {material.quantity.toLocaleString("es-CL")} {material.unit}
                    </TableCell>
                    <TableCell>
                      ${material.unit_cost.toLocaleString("es-CL")} CLP
                    </TableCell>
                    <TableCell>{getStatusBadge(material.status)}</TableCell>
                    <TableCell>
                      {new Date(material.purchase_date).toLocaleDateString("es-CL")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditMaterial(material)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMaterial(material.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}