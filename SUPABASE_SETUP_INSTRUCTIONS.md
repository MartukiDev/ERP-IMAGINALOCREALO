# 📋 Instrucciones de Configuración de Supabase

## ✅ Lo que ya está listo en el código

1. ✅ Cliente de Supabase configurado (`lib/supabase/client.ts`)
2. ✅ Tipos TypeScript completos (`lib/supabase/types.ts`)
3. ✅ Hooks personalizados con real-time (`lib/supabase/hooks.ts`)
4. ✅ Componentes de autenticación (login, logout, protected routes)
5. ✅ Componente de Productos migrado a Supabase
6. ✅ Componente de Materiales migrado a Supabase

## 🎯 Acciones que DEBES hacer en Supabase

### Paso 1: Ejecutar el Script SQL de la Base de Datos

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Navega a **SQL Editor** en el menú lateral
3. Crea una nueva query
4. Copia y pega **TODO** el contenido del archivo `supabase-setup.sql`
5. Haz clic en **Run** (o presiona Ctrl+Enter / Cmd+Enter)
6. ✅ Verifica que no haya errores

**Esto creará:**
- 8 tablas principales (users, machines, materials, quotations, products, sales, stock_movements, material_movements, transactions, settings)
- Índices para optimizar consultas
- Triggers para automatizar cálculos y movimientos
- Políticas RLS (Row Level Security)
- Función para calcular estadísticas del dashboard

### Paso 2: Habilitar Autenticación por Email

1. Ve a **Authentication** → **Providers** en Supabase
2. Asegúrate de que **Email** esté habilitado
3. Configura las opciones:
   - ✅ Enable Email provider
   - ✅ Confirm email: **Deshabilitado** (para desarrollo)
   - Más tarde puedes habilitarlo y configurar SMTP

### Paso 3: Insertar Máquinas Iniciales (OPCIONAL pero recomendado)

Ejecuta esto en el **SQL Editor** para tener máquinas de prueba:

\`\`\`sql
-- Insertar máquinas de ejemplo
INSERT INTO machines (name, type, hourly_cost, brand, model) VALUES
('Ender 3 V2', 'FDM', 150, 'Creality', 'Ender 3 V2'),
('Photon Mono X', 'Resina', 200, 'Anycubic', 'Photon Mono X'),
('Prusa i3 MK3S', 'FDM', 250, 'Prusa', 'i3 MK3S');
\`\`\`

### Paso 4: Verificar Variables de Entorno

Confirma que tu archivo `.env.local` tiene:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
\`\`\`

**Dónde encontrar estos valores:**
1. Ve a **Project Settings** → **API** en Supabase
2. Copia la **URL** y la **anon/public key**

## 🚀 Cómo Probar el Sistema

### 1. Iniciar el servidor de desarrollo

\`\`\`bash
pnpm dev
\`\`\`

### 2. Crear tu primera cuenta

1. Ve a `http://localhost:3000/login`
2. Haz clic en "¿No tienes cuenta? Regístrate"
3. Ingresa:
   - Nombre completo
   - Email
   - Contraseña (mínimo 6 caracteres)
4. Haz clic en "Crear Cuenta"
5. La cuenta se creará automáticamente con rol **admin**

### 3. Probar funcionalidades

#### ✅ Materiales
1. Ve a "Inventario de materiales"
2. Haz clic en "Agregar material"
3. Completa el formulario:
   - Nombre: "PLA Blanco"
   - Tipo: "Filamento"
   - Cantidad: 5000
   - Unidad: Gramos (g)
   - Costo unitario: 0.025
   - Fecha de compra: (selecciona una fecha)
4. Haz clic en "Agregar"
5. ✅ Verifica que aparezca en la tabla
6. Prueba editar y eliminar

#### ✅ Productos
1. Ve a "Productos"
2. Por ahora estará vacío (necesitas crear productos desde Cotizaciones)

#### ✅ Cotizaciones (Pendiente de migrar)
- Este componente todavía usa localStorage
- Se migrará en el siguiente paso

## 🔧 Problemas Comunes y Soluciones

### Error: "Invalid API key"
- ✅ Verifica que las variables de entorno estén correctas
- ✅ Reinicia el servidor de desarrollo (`pnpm dev`)

### Error: "relation does not exist"
- ✅ Ejecuta el script SQL completo en Supabase
- ✅ Verifica que todas las tablas se hayan creado en **Database** → **Tables**

### Error: "permission denied for table"
- ✅ Las políticas RLS están activas
- ✅ Asegúrate de estar autenticado
- ✅ Verifica que el trigger de `handle_new_user()` esté funcionando

### No puedo crear cuenta
- ✅ Verifica que Email Auth esté habilitado en Supabase
- ✅ Revisa la consola del navegador para ver errores específicos

## 📊 Verificar que Todo Funciona

### En Supabase Dashboard:

1. **Table Editor** → **users**: Debe haber un registro con tu cuenta
2. **Table Editor** → **materials**: Deben aparecer los materiales que agregaste
3. **Table Editor** → **machines**: Deben estar las máquinas que insertaste
4. **Authentication** → **Users**: Debe aparecer tu usuario

### En la Aplicación:

1. ✅ Login funciona
2. ✅ Header muestra tu nombre
3. ✅ Puedes crear materiales
4. ✅ Los materiales se guardan y persisten al recargar
5. ✅ Puedes editar y eliminar materiales
6. ✅ El botón "Cerrar Sesión" funciona

## 🎉 ¡Listo!

Si todo funciona correctamente:
- ✅ Tu base de datos está configurada
- ✅ La autenticación funciona
- ✅ Los materiales se guardan en Supabase
- ✅ Los productos están listos para usarse
- ⏳ Falta migrar Cotizaciones y Dashboard

## 📝 Próximos Pasos

1. **Migrar Cotizaciones**: Actualizar para usar Supabase y guardar quotations
2. **Migrar Dashboard**: Conectar con estadísticas reales usando `useDashboardStats`
3. **Eliminar localStorage**: Buscar y remover todo código de localStorage
4. **Configurar SMTP** (opcional): Para emails de verificación
5. **Deploy**: Subir a producción (Vercel + Supabase)

## 🆘 ¿Necesitas Ayuda?

Si encuentras algún error:
1. Abre la consola del navegador (F12)
2. Revisa la pestaña "Console" para errores de JavaScript
3. Revisa la pestaña "Network" para errores de API
4. Copia el error y avísame para ayudarte

---

**Fecha de creación**: 22 de octubre de 2025  
**Versión**: 1.0
