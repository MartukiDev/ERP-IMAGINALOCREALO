import { useEffect, useState } from 'react'
import { supabase } from './client'
import type { Database } from './types'

type Product = Database['public']['Tables']['products']['Row']
type Material = Database['public']['Tables']['materials']['Row']
type Sale = Database['public']['Tables']['sales']['Row']
type Quotation = Database['public']['Tables']['quotations']['Row']
type Machine = Database['public']['Tables']['machines']['Row']
type Transaction = Database['public']['Tables']['transactions']['Row']

// Caché simple para productos
let productsCache: Product[] | null = null
let productsCacheTime = 0
const CACHE_DURATION = 30000 // 30 segundos

// Hook para productos
export function useProducts() {
  const [products, setProducts] = useState<Product[]>(productsCache || [])
  const [loading, setLoading] = useState(!productsCache)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Si hay caché válido, usarlo
    const now = Date.now()
    if (productsCache && (now - productsCacheTime) < CACHE_DURATION) {
      setProducts(productsCache)
      setLoading(false)
      return
    }

    fetchProducts()
    
    // Suscripción en tiempo real
    const subscription = supabase
      .channel('products-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' },
        () => fetchProducts()
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      const products = data || []
      setProducts(products)
      // Actualizar caché
      productsCache = products
      productsCacheTime = Date.now()
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  return { products, loading, error, refetch: fetchProducts }
}

// Caché para materiales
let materialsCache: Material[] | null = null
let materialsCacheTime = 0

// Hook para materiales
export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>(materialsCache || [])
  const [loading, setLoading] = useState(!materialsCache)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Si hay caché válido, usarlo
    const now = Date.now()
    if (materialsCache && (now - materialsCacheTime) < CACHE_DURATION) {
      setMaterials(materialsCache)
      setLoading(false)
      return
    }

    fetchMaterials()
    
    const subscription = supabase
      .channel('materials-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'materials' },
        () => fetchMaterials()
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchMaterials() {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .neq('status', 'inactive')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      const materials = data || []
      setMaterials(materials)
      // Actualizar caché
      materialsCache = materials
      materialsCacheTime = Date.now()
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching materials:', err)
    } finally {
      setLoading(false)
    }
  }

  return { materials, loading, error, refetch: fetchMaterials }
}

// Hook para ventas
export function useSales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSales()
    
    const subscription = supabase
      .channel('sales-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'sales' },
        () => fetchSales()
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchSales() {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('sale_date', { ascending: false })
      
      if (error) throw error
      setSales(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching sales:', err)
    } finally {
      setLoading(false)
    }
  }

  return { sales, loading, error, refetch: fetchSales }
}

// Hook para cotizaciones
export function useQuotations() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchQuotations()
    
    const subscription = supabase
      .channel('quotations-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'quotations' },
        () => fetchQuotations()
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchQuotations() {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setQuotations(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching quotations:', err)
    } finally {
      setLoading(false)
    }
  }

  return { quotations, loading, error, refetch: fetchQuotations }
}

// Hook para máquinas
export function useMachines() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMachines()
  }, [])

  async function fetchMachines() {
    try {
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      setMachines(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching machines:', err)
    } finally {
      setLoading(false)
    }
  }

  return { machines, loading, error, refetch: fetchMachines }
}

// Hook para transacciones
export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTransactions()
    
    const subscription = supabase
      .channel('transactions-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => fetchTransactions()
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchTransactions() {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
        .limit(100)
      
      if (error) throw error
      setTransactions(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  return { transactions, loading, error, refetch: fetchTransactions }
}

// Hook para estadísticas del dashboard
export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStockMaterials: 0,
    salesLast30Days: 0,
    profitLast30Days: 0,
  })
  const [revenueData, setRevenueData] = useState<Array<{ name: string; ingresos: number; egresos: number }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      // Total productos
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Total stock
      const { data: products } = await supabase
        .from('products')
        .select('stock')
        .eq('is_active', true)
      
      const totalStock = products?.reduce((sum, p) => sum + p.stock, 0) || 0

      // Materiales con bajo stock
      const { count: lowStockCount } = await supabase
        .from('materials')
        .select('*', { count: 'exact', head: true })
        .in('status', ['low', 'out'])

      // Ventas últimos 30 días
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { data: sales } = await supabase
        .from('sales')
        .select('total_amount, profit')
        .gte('sale_date', thirtyDaysAgo.toISOString().split('T')[0])

      const salesLast30Days = sales?.reduce((sum, s) => sum + s.total_amount, 0) || 0
      const profitLast30Days = sales?.reduce((sum, s) => sum + s.profit, 0) || 0

      // Obtener datos mensuales de ingresos/egresos (últimos 6 meses)
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      const { data: allTransactions } = await supabase
        .from('transactions')
        .select('amount, type, transaction_date')
        .gte('transaction_date', sixMonthsAgo.toISOString().split('T')[0])
        .order('transaction_date', { ascending: true })

      // Agrupar por mes
      const monthlyData: Record<string, { ingresos: number; egresos: number }> = {}
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dec']
      
      allTransactions?.forEach(tx => {
        const date = new Date(tx.transaction_date)
        const monthKey = `${monthNames[date.getMonth()]}`
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { ingresos: 0, egresos: 0 }
        }
        
        if (tx.type === 'income') {
          monthlyData[monthKey].ingresos += tx.amount
        } else {
          monthlyData[monthKey].egresos += tx.amount
        }
      })

      const chartData = Object.entries(monthlyData).map(([name, data]) => ({
        name,
        ...data
      }))

      setRevenueData(chartData)
      setStats({
        totalProducts: productsCount || 0,
        totalStock,
        lowStockMaterials: lowStockCount || 0,
        salesLast30Days,
        profitLast30Days,
      })
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  return { stats, revenueData, loading, error, refetch: fetchStats }
}

// Hook para obtener el usuario actual
export function useUser() {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<Database['public']['Tables']['users']['Row'] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    let authInitialized = false
    
    // Timeout de seguridad - forzar que loading termine después de 2 segundos
    const safetyTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('⚠️ Auth timeout - forcing loading to false')
        setLoading(false)
      }
    }, 2000)
    
    // Función para cargar datos del usuario
    const loadUserData = async (userId: string) => {
      try {
        console.log('📊 Loading user data for:', userId)
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (error) {
          console.error('❌ RLS may be blocking user data:', error.message)
          // Si RLS bloquea, crear userData desde user_metadata
          return null
        }
        
        if (data) {
          console.log('✅ User data loaded:', (data as any).full_name || (data as any).email)
          return data
        }
        
        return null
      } catch (err: any) {
        console.error('❌ Error fetching user data:', err.message)
        return null
      }
    }

    // Obtener sesión actual
    const initAuth = async () => {
      if (authInitialized) return
      authInitialized = true
      
      try {
        console.log('🔑 Getting session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!isMounted) return
        
        if (error) {
          console.error('❌ Error getting session:', error)
          if (isMounted) setLoading(false)
          return
        }
        
        if (session?.user) {
          console.log('✅ Session found:', session.user.email)
          if (isMounted) setUser(session.user)
          
          // Cargar datos del usuario (intentar pero no bloquear si falla)
          const data = await loadUserData(session.user.id)
          if (isMounted) {
            setUserData(data)
          }
        } else {
          console.log('ℹ️ No session found')
          if (isMounted) {
            setUser(null)
            setUserData(null)
          }
        }
        
        if (isMounted) {
          console.log('✅ Auth initialization complete')
          setLoading(false)
        }
      } catch (error: any) {
        console.error('❌ Error in initAuth:', error.message)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initAuth()

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return
      
      console.log('🔐 Auth state changed:', event, session?.user?.email)
      
      if (session?.user) {
        setUser(session.user)
        const data = await loadUserData(session.user.id)
        if (isMounted && data) {
          setUserData(data)
        }
      } else {
        setUser(null)
        setUserData(null)
      }
      
      // Asegurar que loading siempre se actualice
      if (isMounted) {
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
    }
  }, [])

  return { user, userData, loading }
}
