# Guía de Implementación - Migración a Supabase

## 📋 Tabla de Contenidos
1. [Configuración Inicial](#configuración-inicial)
2. [Instalación de Dependencias](#instalación-de-dependencias)
3. [Configuración del Cliente Supabase](#configuración-del-cliente-supabase)
4. [Migración de Datos](#migración-de-datos)
5. [Actualización de Componentes](#actualización-de-componentes)
6. [Testing](#testing)
7. [Despliegue](#despliegue)

---

## 1. Configuración Inicial

### Paso 1.1: Crear Proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com)
2. Crear una nueva organización o usar una existente
3. Crear un nuevo proyecto:
   - Nombre: `erp-3d-studio`
   - Base de datos password: **guardar en lugar seguro**
   - Región: Elegir la más cercana (ej: South America - São Paulo)

### Paso 1.2: Ejecutar Scripts SQL

1. En el Dashboard de Supabase, ir a **SQL Editor**
2. Copiar y pegar el contenido completo de `supabase-setup.sql`
3. Ejecutar el script (puede tomar 1-2 minutos)
4. Verificar que no haya errores

### Paso 1.3: Configurar Variables de Entorno

1. En el Dashboard de Supabase, ir a **Settings > API**
2. Copiar las siguientes credenciales:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon/public key**: `eyJhbGc...`

3. Crear archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

4. Agregar `.env.local` al `.gitignore`:

```gitignore
# .gitignore
.env.local
.env*.local
```

---

## 2. Instalación de Dependencias

```bash
# Instalar Supabase client
pnpm add @supabase/supabase-js

# Instalar dependencias para autenticación
pnpm add @supabase/auth-helpers-nextjs @supabase/auth-ui-react @supabase/auth-ui-shared

# TypeScript types (opcional pero recomendado)
pnpm add -D @supabase/supabase-js
```

---

## 3. Configuración del Cliente Supabase

### Paso 3.1: Crear cliente de Supabase

Crear archivo `lib/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### Paso 3.2: Generar TypeScript Types

1. Instalar Supabase CLI:

```bash
npm install -g supabase
```

2. Login a Supabase:

```bash
supabase login
```

3. Generar types:

```bash
supabase gen types typescript --project-id "your-project-id" > lib/supabase/database.types.ts
```

### Paso 3.3: Crear Hooks Personalizados

Crear archivo `lib/supabase/hooks.ts`:

```typescript
import { useEffect, useState } from 'react'
import { supabase } from './client'
import type { Database } from './database.types'

type Product = Database['public']['Tables']['products']['Row']
type Material = Database['public']['Tables']['materials']['Row']
type Sale = Database['public']['Tables']['sales']['Row']

// Hook para productos
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
    
    // Suscripción a cambios en tiempo real
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
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching products:', error)
    } else {
      setProducts(data || [])
    }
    setLoading(false)
  }

  return { products, loading, refetch: fetchProducts }
}

// Hook para materiales
export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching materials:', error)
    } else {
      setMaterials(data || [])
    }
    setLoading(false)
  }

  return { materials, loading, refetch: fetchMaterials }
}

// Hook para ventas
export function useSales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

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
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        products(name, suggested_price)
      `)
      .order('sale_date', { ascending: false })
    
    if (error) {
      console.error('Error fetching sales:', error)
    } else {
      setSales(data || [])
    }
    setLoading(false)
  }

  return { sales, loading, refetch: fetchSales }
}
```

---

## 4. Migración de Datos

### Paso 4.1: Script de Migración desde localStorage

Crear archivo `lib/migration/migrate-localstorage.ts`:

```typescript
import { supabase } from '../supabase/client'

interface LocalStorageProduct {
  id: string
  name: string
  totalCost: number
  suggestedPrice: number
  stock: number
  createdDate: string
}

interface LocalStorageSale {
  id: string
  productId: string
  productName: string
  quantity: number
  pricePerUnit: number
  totalAmount: number
  cost: number
  profit: number
  date: string
  timestamp: string
}

export async function migrateFromLocalStorage() {
  const results = {
    products: { success: 0, failed: 0 },
    sales: { success: 0, failed: 0 },
  }

  try {
    // Migrar productos
    const productsJson = localStorage.getItem('products')
    if (productsJson) {
      const products: LocalStorageProduct[] = JSON.parse(productsJson)
      
      for (const product of products) {
        const { error } = await supabase.from('products').insert({
          name: product.name,
          total_cost: product.totalCost,
          suggested_price: product.suggestedPrice,
          stock: product.stock,
          created_date: product.createdDate,
        })

        if (error) {
          console.error(`Error migrating product ${product.name}:`, error)
          results.products.failed++
        } else {
          results.products.success++
        }
      }
    }

    // Migrar ventas
    const salesJson = localStorage.getItem('sales')
    if (salesJson) {
      const sales: LocalStorageSale[] = JSON.parse(salesJson)
      
      for (const sale of sales) {
        // Buscar el product_id en la base de datos
        const { data: product } = await supabase
          .from('products')
          .select('id')
          .eq('name', sale.productName)
          .single()

        if (!product) {
          console.error(`Product not found for sale: ${sale.productName}`)
          results.sales.failed++
          continue
        }

        const { error } = await supabase.from('sales').insert({
          product_id: product.id,
          product_name: sale.productName,
          quantity: sale.quantity,
          price_per_unit: sale.pricePerUnit,
          cost_per_unit: sale.cost / sale.quantity,
          sale_date: sale.date,
        })

        if (error) {
          console.error(`Error migrating sale:`, error)
          results.sales.failed++
        } else {
          results.sales.success++
        }
      }
    }

    // Limpiar localStorage después de migración exitosa
    if (results.products.failed === 0 && results.sales.failed === 0) {
      localStorage.removeItem('products')
      localStorage.removeItem('sales')
      console.log('Migration completed successfully!')
    }

    return results
  } catch (error) {
    console.error('Migration error:', error)
    throw error
  }
}
```

### Paso 4.2: Crear botón de migración (temporal)

Agregar en el dashboard o en settings:

```tsx
import { migrateFromLocalStorage } from '@/lib/migration/migrate-localstorage'

function MigrationButton() {
  const [migrating, setMigrating] = useState(false)
  
  async function handleMigration() {
    setMigrating(true)
    try {
      const results = await migrateFromLocalStorage()
      alert(`Migración completada:
        Productos: ${results.products.success} exitosos, ${results.products.failed} fallidos
        Ventas: ${results.sales.success} exitosas, ${results.sales.failed} fallidas`)
    } catch (error) {
      alert('Error en migración. Ver consola.')
    } finally {
      setMigrating(false)
    }
  }
  
  return (
    <Button onClick={handleMigration} disabled={migrating}>
      {migrating ? 'Migrando...' : 'Migrar datos de localStorage'}
    </Button>
  )
}
```

---

## 5. Actualización de Componentes

### Ejemplo: Actualizar `products.tsx`

**ANTES (localStorage):**
```typescript
const [products, setProducts] = useState<Product[]>([...])

const handleDeleteProduct = (id: string) => {
  setProducts(products.filter((product) => product.id !== id))
}
```

**DESPUÉS (Supabase):**
```typescript
import { useProducts } from '@/lib/supabase/hooks'
import { supabase } from '@/lib/supabase/client'

export function Products() {
  const { products, loading, refetch } = useProducts()

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (error) {
      alert('Error al eliminar producto: ' + error.message)
    } else {
      refetch() // Opcional, la suscripción real-time lo actualizará automáticamente
    }
  }

  if (loading) {
    return <div>Cargando productos...</div>
  }

  return (
    // ... resto del componente
  )
}
```

### Ejemplo: Crear venta con Supabase

```typescript
const confirmSell = async () => {
  if (!productToSell || !sellQuantity || !sellPrice) return
  
  const quantityToSell = Number.parseInt(sellQuantity, 10)
  const pricePerUnit = Number.parseFloat(sellPrice)
  
  if (quantityToSell > productToSell.stock) {
    alert('Stock insuficiente')
    return
  }

  const { error } = await supabase.from('sales').insert({
    product_id: productToSell.id,
    product_name: productToSell.name,
    quantity: quantityToSell,
    price_per_unit: pricePerUnit,
    cost_per_unit: productToSell.total_cost,
    sale_date: new Date().toISOString().split('T')[0],
  })

  if (error) {
    alert('Error al registrar venta: ' + error.message)
  } else {
    alert('Venta registrada exitosamente')
    setIsSellDialogOpen(false)
    // Los triggers de la BD actualizarán el stock automáticamente
  }
}
```

---

## 6. Testing

### Checklist de Testing

- [ ] **Productos**
  - [ ] Crear producto desde cotización
  - [ ] Incrementar stock
  - [ ] Vender producto
  - [ ] Eliminar producto
  - [ ] Verificar actualización en tiempo real

- [ ] **Materiales**
  - [ ] Agregar material
  - [ ] Editar material
  - [ ] Eliminar material
  - [ ] Verificar cambio de estado (active/low/out)

- [ ] **Ventas**
  - [ ] Registrar venta
  - [ ] Verificar descuento de stock
  - [ ] Verificar creación de transacción financiera
  - [ ] Consultar historial

- [ ] **Cotizaciones**
  - [ ] Crear cotización
  - [ ] Guardar como producto
  - [ ] Verificar vínculo cotización-producto

- [ ] **Reportes**
  - [ ] Datos financieros correctos
  - [ ] Gráficos funcionando
  - [ ] Filtros por fecha

---

## 7. Despliegue

### Paso 7.1: Configurar en Vercel/Netlify

1. Agregar variables de entorno:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   ```

2. Rebuild y deploy

### Paso 7.2: Backup y Monitoreo

1. Configurar backups automáticos en Supabase (Settings > Database)
2. Habilitar monitoreo de errores (opcional: Sentry)
3. Configurar alertas para queries lentas

---

## 🎯 Próximos Pasos Recomendados

1. **Autenticación**
   - Implementar Supabase Auth
   - Roles de usuario (admin/user)
   - Control de permisos

2. **Performance**
   - Implementar paginación en tablas grandes
   - Caché de consultas frecuentes
   - Optimizar queries

3. **Features Adicionales**
   - Exportar reportes a PDF/Excel
   - Notificaciones en tiempo real
   - Dashboard analytics mejorado
   - Multi-tenant (si es necesario)

4. **Seguridad**
   - Auditoría de cambios
   - Rate limiting
   - Validación de datos en backend

---

## 📚 Recursos

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Database Design Best Practices](https://supabase.com/docs/guides/database/design)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

