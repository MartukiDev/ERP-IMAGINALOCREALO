# 🔍 Test de Autenticación - Diagnóstico

## Pasos para verificar que la sesión se persiste correctamente:

### 1. Verificar localStorage en el navegador

Abre DevTools (F12) → Console y ejecuta:

```javascript
// Ver todas las claves de localStorage
console.log('localStorage keys:', Object.keys(localStorage))

// Ver específicamente la sesión de Supabase
console.log('Supabase auth token:', localStorage.getItem('supabase.auth.token'))

// Ver todo localStorage de Supabase
Object.keys(localStorage).forEach(key => {
  if (key.includes('supabase')) {
    console.log(key, localStorage.getItem(key))
  }
})
```

### 2. Verificar que la sesión se mantiene después de recargar

```javascript
// Ejecuta esto ANTES de recargar
console.log('Session before reload:', await supabase.auth.getSession())

// Recarga la página (F5)

// Ejecuta esto DESPUÉS de recargar
console.log('Session after reload:', await supabase.auth.getSession())
```

### 3. Verificar eventos de autenticación

```javascript
// Escuchar todos los eventos de auth
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔐 Auth event:', event, session?.user?.email)
})
```

### 4. Test completo

Ejecuta este script en la consola del navegador:

```javascript
// TEST COMPLETO DE AUTENTICACIÓN
(async () => {
  console.log('=== TEST DE AUTENTICACIÓN ===')
  
  // 1. Ver sesión actual
  const { data: { session } } = await supabase.auth.getSession()
  console.log('✅ Sesión actual:', session ? session.user.email : 'No hay sesión')
  
  // 2. Ver localStorage
  const authToken = localStorage.getItem('supabase.auth.token')
  console.log('✅ Token en localStorage:', authToken ? 'Existe' : '❌ No existe')
  
  // 3. Ver usuario en DB
  if (session) {
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
    console.log('✅ Usuario en DB:', userData)
  }
  
  console.log('=== FIN DEL TEST ===')
})()
```

## ✅ Resultados esperados:

- ✅ `localStorage.getItem('supabase.auth.token')` debe retornar un objeto JSON con la sesión
- ✅ Después de recargar, `getSession()` debe retornar la misma sesión
- ✅ El nombre debe aparecer en el header después de recargar

## ❌ Si falla:

1. **No hay token en localStorage**: Las variables de entorno están mal o el cliente no se configuró bien
2. **Token existe pero sesión es null**: El token expiró o es inválido
3. **Sesión existe pero no aparece el nombre**: Problema en el hook useUser o en el Header

## 🔧 Soluciones rápidas:

### Si el token no persiste:
```javascript
// Forzar logout y login de nuevo
await supabase.auth.signOut()
localStorage.clear()
// Volver a hacer login
```

### Si el nombre no aparece:
```javascript
// Ver si userData se está cargando
const { data: { session } } = await supabase.auth.getSession()
const { data: userData } = await supabase
  .from('users')
  .select('*')
  .eq('id', session.user.id)
  .single()
console.log('User data:', userData)
```
