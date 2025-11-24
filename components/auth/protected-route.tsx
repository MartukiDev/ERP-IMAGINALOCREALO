"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/supabase/auth-provider"
import { Spinner } from "@/components/ui/spinner"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showTimeout, setShowTimeout] = useState(false)

  useEffect(() => {
    // Mostrar mensaje de timeout después de 1 segundo
    const timeoutId = setTimeout(() => {
      if (loading) {
        setShowTimeout(true)
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [loading])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="text-muted-foreground">Verificando sesión...</p>
          {showTimeout && (
            <div className="flex flex-col items-center gap-2 mt-4">
              <p className="text-sm text-muted-foreground">Esto está tardando más de lo normal</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
              >
                Recargar página
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}

