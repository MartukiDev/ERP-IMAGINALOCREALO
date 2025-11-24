# 🔧 Solución al Error "Failed to Fetch" al Iniciar Sesión

## ❌ Problema
Al intentar iniciar sesión aparece el error: **"Failed to fetch"**

## 🔍 Causa
Falta el archivo `.env.local` con las credenciales de tu proyecto Supabase.

---

## ✅ Solución Paso a Paso

### Paso 1: Obtener credenciales de Supabase

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Selecciona tu proyecto (o créalo si no existe)
3. Ve a **Settings** (⚙️ en la barra lateral)
4. Click en **API**
5. Copia los siguientes valores:
   - **Project URL** (ej: `https://abcdefgh.supabase.co`)
   - **anon public** key (bajo "Project API keys")

### Paso 2: Crear archivo .env.local

En la raíz del proyecto (`/Users/martodev/Desktop/erp-3d-studio/`), crea un archivo llamado `.env.local` con este contenido:

```bash
# Reemplaza con tus valores reales de Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tu_clave_aqui...
```

**⚠️ IMPORTANTE**: 
- Reemplaza `https://tu-proyecto.supabase.co` con tu Project URL real
- Reemplaza la clave con tu anon public key real
- NO compartas estas credenciales públicamente

### Paso 3: Reiniciar el servidor de desarrollo

```bash
# Detener el servidor (Ctrl+C si está corriendo)
# Luego ejecutar:
npm run dev
# o
pnpm dev
# o
yarn dev
```

### Paso 4: Verificar que funciona

1. Abre [http://localhost:3000/login](http://localhost:3000/login)
2. Intenta iniciar sesión
3. ✅ Debe funcionar sin error "Failed to fetch"

---

## 🔧 Comandos Rápidos (Terminal)

### Opción A: Crear .env.local manualmente
```bash
cd /Users/martodev/Desktop/erp-3d-studio
nano .env.local
# Pega el contenido con tus credenciales
# Guarda con Ctrl+O, Enter, Ctrl+X
```

### Opción B: Crear desde template
```bash
cd /Users/martodev/Desktop/erp-3d-studio
cp .env.local.example .env.local
nano .env.local
# Edita y reemplaza los valores
```

---

## 📋 Checklist de Verificación

Antes de continuar, verifica que:

- [ ] Tienes un proyecto creado en Supabase
- [ ] Has ejecutado `supabase-setup.sql` en SQL Editor
- [ ] Has creado el archivo `.env.local`
- [ ] Las credenciales en `.env.local` son correctas
- [ ] Has reiniciado el servidor de desarrollo
- [ ] Puedes acceder a `http://localhost:3000/login`

---

## 🐛 Si Aún No Funciona

### Error: "Invalid API key"
- Verifica que copiaste la clave **anon public** (NO la service_role key)
- Asegúrate de copiar la clave completa (es muy larga)

### Error: "Project not found"
- Verifica que la URL sea exactamente la de tu proyecto
- No agregues `/` al final de la URL

### Error: Las variables no se cargan
```bash
# Verifica que el archivo existe
ls -la .env.local

# Verifica que las variables empiezan con NEXT_PUBLIC_
cat .env.local

# Reinicia el servidor completamente
# Ctrl+C para detener
npm run dev
```

### Verificar que las variables están disponibles
Agrega esto temporalmente en `lib/supabase/client.ts`:
```typescript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

Si aparece `undefined`, el archivo `.env.local` no se está cargando correctamente.

---

## 🎯 Ejemplo Real de .env.local

```bash
# Ejemplo (NO uses estos valores, son de ejemplo)
NEXT_PUBLIC_SUPABASE_URL=https://xyzabcdefghijklm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiY2RlZmdoaWprbG0iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMDAwMDAwMCwiZXhwIjoxOTQ1NTc2MDAwfQ.ejemplo_de_firma_jwt_muy_larga_aqui
```

---

## ✅ Después de Configurar

Una vez que el archivo `.env.local` esté configurado correctamente:

1. ✅ El login funcionará
2. ✅ El registro funcionará
3. ✅ Todas las operaciones con Supabase funcionarán
4. ✅ No más error "Failed to fetch"

---

## 📞 Siguiente Paso

Después de crear `.env.local` y reiniciar el servidor:

1. Ve a `/login`
2. Regístrate con un email y contraseña
3. Si todo está bien configurado, serás redirigido al dashboard

**¡Buena suerte!** 🚀
