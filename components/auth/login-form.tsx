"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      // Actualizar last_login
      if (data.user) {
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id)
      }

      // Esperar un poco para que la sesión se persista
      await new Promise(resolve => setTimeout(resolve, 500))
      
      router.push("/")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Registrar en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      })

      if (error) throw error

      // Crear usuario en la tabla users
      if (data.user) {
        const { error: userError } = await supabase.from('users').insert({
          id: data.user.id,
          email: formData.email,
          full_name: formData.fullName,
          role: 'admin', // Por defecto admin ya que eres el único usuario
        })

        // Si el error es por duplicate key, la cuenta SÍ se creó exitosamente
        if (userError) {
          if (userError.message.includes('duplicate') || userError.message.includes('users_pkey')) {
            setSuccessMessage('✅ Cuenta creada exitosamente. Redirigiendo...')
            setTimeout(() => {
              router.push('/')
              router.refresh()
            }, 2000)
            return
          }
          throw userError
        }
      }

      setSuccessMessage('✅ Cuenta creada exitosamente! Redirigiendo...')
      setTimeout(() => {
        setIsSignUp(false)
        router.push('/')
        router.refresh()
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Error al crear cuenta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader>
          <CardTitle className="text-2xl text-card-foreground">
            {isSignUp ? "Crear Cuenta" : "Iniciar Sesión"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isSignUp
              ? "Crea una cuenta para acceder al ERP 3D Studio"
              : "Ingresa tus credenciales para acceder al sistema"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
            {isSignUp && (
              <div>
                <Label htmlFor="fullName" className="text-card-foreground">
                  Nombre Completo
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="bg-secondary border-border text-secondary-foreground"
                  required={isSignUp}
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-card-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-secondary border-border text-secondary-foreground"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-card-foreground">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-secondary border-border text-secondary-foreground"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading 
                ? (isSignUp ? "Creando cuenta..." : "Iniciando sesión...") 
                : (isSignUp ? "Crear Cuenta" : "Iniciar Sesión")
              }
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError(null)
                  setSuccessMessage(null)
                }}
                className="text-sm text-primary hover:underline"
                disabled={loading}
              >
                {isSignUp ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
