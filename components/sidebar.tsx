"use client"

import { LayoutDashboard, Package, FileText, Box, ShoppingCart, DollarSign, BarChart3, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "materials", label: "Inventario de materiales", icon: Package },
  { id: "quotations", label: "Cotizaciones", icon: FileText },
  { id: "products", label: "Productos", icon: Box },
  { id: "sales", label: "Ventas", icon: ShoppingCart },
  { id: "finance", label: "Finanzas", icon: DollarSign },
  { id: "reports", label: "Reportes", icon: BarChart3 },
]

export function Sidebar({ activeSection, setActiveSection, isOpen, onClose }: SidebarProps) {
  const handleItemClick = (itemId: string) => {
    setActiveSection(itemId)
    // En móvil, cerrar el sidebar después de seleccionar
    if (window.innerWidth < 1024) {
      onClose()
    }
  }

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50",
          "w-64 bg-sidebar border-r border-sidebar-border flex flex-col",
          "transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">Imagínalo Crealo</h1>
            <h2 className="text-sm font-semibold text-sidebar-foreground">ERP para impresión 3D</h2>
          </div>
          {/* Botón cerrar solo en móvil */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-sidebar-foreground" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  activeSection === item.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
