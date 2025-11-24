"use client"

import { useState, lazy, Suspense } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Spinner } from "@/components/ui/spinner"

// Lazy loading de componentes para mejorar rendimiento
const Dashboard = lazy(() => import("@/components/sections/dashboard").then(m => ({ default: m.Dashboard })))
const MaterialInventory = lazy(() => import("@/components/sections/material-inventory").then(m => ({ default: m.MaterialInventory })))
const Quotations = lazy(() => import("@/components/sections/quotations").then(m => ({ default: m.Quotations })))
const Products = lazy(() => import("@/components/sections/products").then(m => ({ default: m.Products })))
const Sales = lazy(() => import("@/components/sections/sales").then(m => ({ default: m.Sales })))
const Finance = lazy(() => import("@/components/sections/finance").then(m => ({ default: m.Finance })))
const Reports = lazy(() => import("@/components/sections/reports").then(m => ({ default: m.Reports })))

// Componente de loading para las secciones
function SectionLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner className="h-8 w-8 text-primary" />
    </div>
  )
}

export default function Home() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />
      case "materials":
        return <MaterialInventory />
      case "quotations":
        return <Quotations />
      case "products":
        return <Products />
      case "sales":
        return <Sales />
      case "finance":
        return <Finance />
      case "reports":
        return <Reports />
      default:
        return <Dashboard />
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex flex-col flex-1 overflow-hidden w-full lg:w-auto">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <Suspense fallback={<SectionLoader />}>
              {renderSection()}
            </Suspense>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {renderSection()}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
