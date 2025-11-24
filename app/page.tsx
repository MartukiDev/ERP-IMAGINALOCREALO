"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Dashboard } from "@/components/sections/dashboard"
import { MaterialInventory } from "@/components/sections/material-inventory"
import { Quotations } from "@/components/sections/quotations"
import { Products } from "@/components/sections/products"
import { Sales } from "@/components/sections/sales"
import { Finance } from "@/components/sections/finance"
import { Reports } from "@/components/sections/reports"
import { ProtectedRoute } from "@/components/auth/protected-route"

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
            {renderSection()}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
