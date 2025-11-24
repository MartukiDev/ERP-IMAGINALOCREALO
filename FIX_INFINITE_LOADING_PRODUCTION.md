# Solución: Loading Infinito en Producción

## Problema
Al hacer deploy en producción (Vercel), la página se queda en "Verificando sesión..." indefinidamente.

## Causa
El hook `useUser` puede no actualizar correctamente el estado de `loading` en producción debido a:

1. Latencia de red más alta en producción
2. Problemas con la sesión de Supabase
3. Variables de entorno no configuradas en Vercel
4. Falta de timeout de seguridad

## Soluciones Aplicadas

### 1. Timeout de Seguridad en `useUser`
Se agregó un timeout de 5 segundos que fuerza que `loading` cambie a `false` si no se resuelve antes.

**Archivo**: `lib/supabase/hooks.ts`
```typescript
// Timeout de seguridad - forzar que loading termine después de 5 segundos
const safetyTimeout = setTimeout(() => {
  if (isMounted && loading) {
    console.warn('⚠️ Auth timeout - forcing loading to false')
    setLoading(false)
  }
}, 5000)
```

### 2. Mejora en el Cliente de Supabase
Se agregó `flowType: 'pkce'` para mejor manejo de autenticación en producción.

**Archivo**: `lib/supabase/client.ts`
```typescript
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // ← Mejora la seguridad y compatibilidad
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'supabase.auth.token',
  },
})
```

### 3. Actualización de `onAuthStateChange`
Se removió la condición que solo actualizaba `loading` en ciertos eventos.

**Antes**:
```typescript
if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
  if (isMounted) {
    setLoading(false)
  }
}
```

**Después**:
```typescript
// Asegurar que loading siempre se actualice
if (isMounted) {
  setLoading(false)
}
```

### 4. Mejora en `ProtectedRoute`
- Reducción del timeout de mensaje de 3s a 2s
- Agregado estado `redirecting` para evitar múltiples redirects

## Verificación en Vercel

### Variables de Entorno
Asegúrate de que estas variables estén configuradas en Vercel:

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Verifica que existan:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

### Pasos para Configurar en Vercel

1. **Dashboard de Vercel** → Tu proyecto
2. **Settings** → **Environment Variables**
3. Agregar las dos variables:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://fgumcvofssvinpufdgyr.supabase.co`
   
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: (tu anon key de Supabase)

4. **Importante**: Aplica las variables a todos los entornos:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. **Redeploy** después de configurar las variables

## Comandos para Deploy

```bash
# Hacer commit de los cambios
git add .
git commit -m "fix: infinite loading in production"
git push origin main

# Vercel automáticamente hará deploy
```

## Verificación

Después del deploy:

1. Abre DevTools (F12) en producción
2. Ve a la pestaña Console
3. Deberías ver logs como:
   ```
   🔑 Getting session...
   ✅ Session found: usuario@email.com
   ✅ Auth initialization complete
   ```

4. Si ves errores, verifica:
   - Las variables de entorno en Vercel
   - La configuración de RLS en Supabase
   - Los logs en Vercel Dashboard

## Debugging Adicional

Si el problema persiste:

1. **Verifica los logs de Vercel**:
   - Dashboard → Deployment → Functions
   - Busca errores de servidor

2. **Verifica Supabase**:
   - Dashboard → Authentication → Users
   - Asegúrate de que los usuarios existan
   
3. **Limpia localStorage**:
   ```javascript
   // En la consola del navegador
   localStorage.clear()
   location.reload()
   ```

4. **Verifica CORS en Supabase**:
   - Settings → API
   - Agregar tu dominio de Vercel a URL Configuration

## Monitoreo

Después del deploy, monitorea:
- Tiempo de carga inicial
- Errores en Vercel Logs
- Errores en Supabase Logs
- Feedback de usuarios

## Prevención

Para evitar este problema en el futuro:

1. ✅ Siempre incluir timeouts en operaciones async
2. ✅ Verificar variables de entorno antes de deploy
3. ✅ Testear en preview deployment antes de producción
4. ✅ Monitorear logs después de cada deploy
5. ✅ Implementar retry logic para operaciones críticas

---

**Fecha de aplicación**: 24 de noviembre de 2025
**Archivos modificados**:
- `lib/supabase/hooks.ts`
- `lib/supabase/client.ts`
- `components/auth/protected-route.tsx`
