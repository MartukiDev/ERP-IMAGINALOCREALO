"use client"

import { useState } from "react"
import { useAuth } from "@/lib/supabase/auth-provider"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const router = useRouter()
  const { signOut } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await signOut()
      router.push("/login")
      router.refresh()
    } catch (err: any) {
      console.error("Error al cerrar sesión:", err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={loading}
      className="text-muted-foreground hover:text-foreground"
    >
      <LogOut className="mr-2 h-4 w-4" />
      {loading ? "Cerrando..." : "Cerrar Sesión"}
    </Button>
  )
}
