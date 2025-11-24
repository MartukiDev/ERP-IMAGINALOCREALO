"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Eye, Plus, Trash2, ShoppingCart } from "lucide-react"
import { useProducts } from "@/lib/supabase/hooks"
import { supabase } from "@/lib/supabase/client"
import { Spinner } from "@/components/ui/spinner"

export function Products() {
  const { products, loading, error, refetch } = useProducts()
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false)
  const [stockToAdd, setStockToAdd] = useState("")
  const [productToAddStock, setProductToAddStock] = useState<any>(null)
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false)
  const [sellQuantity, setSellQuantity] = useState("")
  const [sellPrice, setSellPrice] = useState("")
  const [productToSell, setProductToSell] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
      
      await refetch()
    } catch (err: any) {
      alert(`Error al eliminar producto: ${err.message}`)
    }
  }

  const handleAddStock = (product: any) => {
    setProductToAddStock(product)
    setStockToAdd("")
    setIsStockDialogOpen(true)
  }

  const confirmAddStock = async () => {
    if (!productToAddStock || !stockToAdd) return
    
    const quantityToAdd = Number.parseInt(stockToAdd, 10)
    if (quantityToAdd <= 0) {
      alert("La cantidad debe ser mayor a 0")
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
      
      const newStock = productToAddStock.stock + quantityToAdd
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productToAddStock.id)

      if (updateError) throw updateError

      const { error: movementError } = await supabase
        .from('stock_movements')
        // @ts-ignore - Type error due to incomplete type generation
        .insert({
          product_id: productToAddStock.id,
          quantity: quantityToAdd,
          movement_type: 'add',
          previous_stock: productToAddStock.stock,
          new_stock: newStock,
          notes: 'Incremento manual de stock',
          created_by: session.user.id
        })

      if (movementError) throw movementError

      setIsStockDialogOpen(false)
      setStockToAdd("")
      setProductToAddStock(null)
      await refetch()
    } catch (err: any) {
      alert(`Error al agregar stock: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSellProduct = (product: any) => {
    setProductToSell(product)
    setSellQuantity("")
    setSellPrice(product.suggested_price.toString())
    setIsSellDialogOpen(true)
  }

  const confirmSell = async () => {
    if (!productToSell || !sellQuantity || !sellPrice) return
    
    const quantityToSell = Number.parseInt(sellQuantity, 10)
    const pricePerUnit = Number.parseFloat(sellPrice)
    
    if (quantityToSell <= 0) {
      alert("La cantidad debe ser mayor a 0")
      return
    }

    if (quantityToSell > productToSell.stock) {
      alert("Stock insuficiente")
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
      
      const totalAmount = quantityToSell * pricePerUnit
      const totalCost = productToSell.total_cost * quantityToSell
      const profit = totalAmount - totalCost

      const { error: saleError } = await supabase
        .from('sales')
        // @ts-ignore - Type error due to incomplete type generation
        .insert({
          product_id: productToSell.id,
          product_name: productToSell.name,
          quantity: quantityToSell,
          price_per_unit: pricePerUnit,
          total_amount: totalAmount,
          cost_per_unit: productToSell.total_cost,
          total_cost: totalCost,
          profit: profit,
          created_by: session.user.id
        })

      if (saleError) throw saleError

      alert(`Venta registrada exitosamente`)
      
      setIsSellDialogOpen(false)
      setSellQuantity("")
      setSellPrice("")
      setProductToSell(null)
      await refetch()
    } catch (err: any) {
      alert(`Error al registrar venta: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="text-muted-foreground">Cargando productos...</p>
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
        <h1 className="text-2xl lg:text-3xl font-bold">Inventario de productos</h1>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base lg:text-lg">Productos fabricados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6 lg:mx-0 lg:px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Nombre</TableHead>
                  <TableHead className="min-w-[120px]">Costo total</TableHead>
                  <TableHead className="min-w-[120px]">Precio sugerido</TableHead>
                  <TableHead className="min-w-[80px]">Stock</TableHead>
                  <TableHead className="min-w-[120px]">Fecha de creación</TableHead>
                  <TableHead className="min-w-[150px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No hay productos registrados
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>${product.total_cost.toLocaleString("es-CL")} CLP</TableCell>
                    <TableCell>${product.suggested_price.toLocaleString("es-CL")} CLP</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{new Date(product.created_at).toLocaleDateString("es-CL")}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleSellProduct(product)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleAddStock(product)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}>
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

      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Incrementar stock</DialogTitle>
          </DialogHeader>
          {productToAddStock && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Producto: <span className="font-semibold">{productToAddStock.name}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Stock actual: <span className="font-semibold">{productToAddStock.stock}</span>
                </p>
              </div>
              <div>
                <Label htmlFor="stockToAdd">Cantidad a agregar</Label>
                <Input
                  id="stockToAdd"
                  type="number"
                  min="1"
                  value={stockToAdd}
                  onChange={(e) => setStockToAdd(e.target.value)}
                  placeholder="Ingrese la cantidad"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setIsStockDialogOpen(false)} variant="outline" className="flex-1" disabled={submitting}>
                  Cancelar
                </Button>
                <Button onClick={confirmAddStock} className="flex-1" disabled={submitting}>
                  {submitting ? "Agregando..." : "Agregar"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Registrar venta</DialogTitle>
          </DialogHeader>
          {productToSell && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{productToSell.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Costo total:</span>
                    <span>${productToSell.total_cost.toLocaleString("es-CL")} CLP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Precio sugerido:</span>
                    <span className="font-semibold">${productToSell.suggested_price.toLocaleString("es-CL")} CLP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stock disponible:</span>
                    <span>{productToSell.stock} unidades</span>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="sellQuantity">Cantidad a vender</Label>
                <Input
                  id="sellQuantity"
                  type="number"
                  min="1"
                  max={productToSell.stock}
                  value={sellQuantity}
                  onChange={(e) => setSellQuantity(e.target.value)}
                  placeholder="Ingrese la cantidad"
                />
              </div>
              <div>
                <Label htmlFor="sellPrice">Precio de venta (CLP)</Label>
                <Input
                  id="sellPrice"
                  type="number"
                  step="0.01"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  placeholder="Precio por unidad"
                />
              </div>
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">Total:</span>
                  <span className="text-lg font-bold text-primary">
                    ${(Number.parseFloat(sellQuantity || "0") * Number.parseFloat(sellPrice || "0")).toLocaleString("es-CL")} CLP
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setIsSellDialogOpen(false)} variant="outline" className="flex-1" disabled={submitting}>
                  Cancelar
                </Button>
                <Button onClick={confirmSell} className="flex-1" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Registrar venta
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
