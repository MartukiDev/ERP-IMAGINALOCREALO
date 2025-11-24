"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './client'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Timeout agresivo de 1.5 segundos
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('⚠️ Auth loading timeout - checking localStorage')
        const token = localStorage.getItem('supabase.auth.token')
        if (token) {
          console.log('✅ Found token in localStorage - forcing loading complete')
        }
        setLoading(false)
      }
    }, 1500)

    // Inicializar auth
    async function initAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (error) {
          console.error('Auth error:', error)
          setUser(null)
          setLoading(false)
          return
        }

        if (session?.user) {
          setUser(session.user)
        } else {
          setUser(null)
        }

        setLoading(false)
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) setLoading(false)
      }
    }

    initAuth()

    // Listener de cambios
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
