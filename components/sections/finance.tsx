"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useTransactions } from "@/lib/supabase/hooks"
import { supabase } from "@/lib/supabase/client"
import { Spinner } from "@/components/ui/spinner"

export function Finance() {
  const { transactions, loading, refetch } = useTransactions()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    type: "income" as "income" | "expense",
    description: "",
    amount: "",
    date: new Date().toISOString().split('T')[0]
  })

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  const netBalance = totalIncome - totalExpense

  const handleSubmit = async () => {
    if (!formData.description || !formData.amount) {
      alert("Por favor completa todos los campos")
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
      
      const { error } = await supabase
        .from("transactions")
        .insert({
          type: formData.type,
          description: formData.description,
          amount: Number.parseFloat(formData.amount),
          transaction_date: formData.date,
          created_by: session.user.id
        })

      if (error) throw error

      alert("Transacción registrada exitosamente")
      setIsDialogOpen(false)
      setFormData({
        type: "income",
        description: "",
        amount: "",
        date: new Date().toISOString().split('T')[0]
      })
      refetch()
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setSubmitting(false)
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
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-balance">Finanzas</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nueva transacción
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-[95vw] sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">Registrar transacción</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="type" className="text-card-foreground">
                  Tipo
                </Label>
                <Select value={formData.type} onValueChange={(value: "income" | "expense") => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="bg-secondary border-border text-secondary-foreground">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="income">Ingreso</SelectItem>
                    <SelectItem value="expense">Egreso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description" className="text-card-foreground">
                  Descripción
                </Label>
                <Input 
                  id="description" 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-secondary border-border text-secondary-foreground" 
                />
              </div>
              <div>
                <Label htmlFor="amount" className="text-card-foreground">
                  Monto (CLP)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="bg-secondary border-border text-secondary-foreground"
                />
              </div>
              <div>
                <Label htmlFor="date" className="text-card-foreground">
                  Fecha
                </Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-secondary border-border text-secondary-foreground" 
                />
              </div>
              <Button 
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {submitting ? <><Spinner className="w-4 h-4 mr-2" />Guardando...</> : "Guardar transacción"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total ingresos</CardTitle>
            <TrendingUp className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">${totalIncome.toLocaleString("es-CL")} CLP</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total egresos</CardTitle>
            <TrendingDown className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${totalExpense.toLocaleString("es-CL")} CLP</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Balance neto</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netBalance >= 0 ? "text-primary" : "text-destructive"}`}>
              ${netBalance.toLocaleString("es-CL")} CLP
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base lg:text-lg text-card-foreground">Historial de transacciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6 lg:mx-0 lg:px-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/50">
                  <TableHead className="text-muted-foreground min-w-[100px]">Tipo</TableHead>
                  <TableHead className="text-muted-foreground min-w-[200px]">Descripción</TableHead>
                  <TableHead className="text-muted-foreground min-w-[120px]">Monto</TableHead>
                  <TableHead className="text-muted-foreground min-w-[100px]">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="border-border hover:bg-muted/50">
                    <TableCell>
                      {transaction.type === "income" ? (
                        <Badge className="bg-accent/20 text-accent">Ingreso</Badge>
                      ) : (
                        <Badge className="bg-destructive/20 text-destructive">Egreso</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-card-foreground">{transaction.description}</TableCell>
                  <TableCell
                    className={
                      transaction.type === "income" ? "text-accent font-semibold" : "text-destructive font-semibold"
                    }
                  >
                    {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString("es-CL")} CLP
                  </TableCell>
                  <TableCell className="text-card-foreground">{transaction.transaction_date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
