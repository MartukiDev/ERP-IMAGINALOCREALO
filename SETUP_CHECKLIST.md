# ✅ CHECKLIST: Configuración Supabase

## 🎯 ANTES DE INICIAR LA APLICACIÓN

### Paso 1: Configurar Base de Datos en Supabase ⚠️ CRÍTICO

```
[ ] 1. Abrir Supabase Dashboard (https://supabase.com/dashboard)
[ ] 2. Seleccionar tu proyecto
[ ] 3. Ir a "SQL Editor" en el menú lateral
[ ] 4. Click en "New Query"
[ ] 5. Abrir el archivo: supabase-setup.sql
[ ] 6. Copiar TODO el contenido (Ctrl+A, Ctrl+C)
[ ] 7. Pegar en el SQL Editor (Ctrl+V)
[ ] 8. Click en "Run" (o Ctrl+Enter / Cmd+Enter)
[ ] 9. Esperar a que termine (puede tomar 5-10 segundos)
[ ] 10. Verificar que no haya errores en rojo
```

**✅ Resultado esperado**: 
- Mensaje de éxito
- Sin errores en rojo
- Se crearon 8 tablas

### Paso 2: Verificar Tablas Creadas

```
[ ] 1. Ir a "Database" → "Tables" en Supabase
[ ] 2. Verificar que existan estas tablas:
    [ ] users
    [ ] machines
    [ ] materials
    [ ] quotations
    [ ] products
    [ ] sales
    [ ] stock_movements
    [ ] material_movements
    [ ] transactions
    [ ] settings
```

### Paso 3: Configurar Autenticación

```
[ ] 1. Ir a "Authentication" → "Providers"
[ ] 2. Verificar que "Email" esté ENABLED (verde)
[ ] 3. En Email settings:
    [ ] Desmarcar "Confirm email" (para desarrollo)
    [ ] Opcional: Configurar SMTP para producción
```

### Paso 4: (OPCIONAL) Insertar Máquinas de Prueba

```
[ ] 1. Volver a "SQL Editor"
[ ] 2. New Query
[ ] 3. Copiar y pegar este código:

INSERT INTO machines (name, type, hourly_cost, brand, model) VALUES
('Ender 3 V2', 'FDM', 150, 'Creality', 'Ender 3 V2'),
('Photon Mono X', 'Resina', 200, 'Anycubic', 'Photon Mono X'),
('Prusa i3 MK3S', 'FDM', 250, 'Prusa', 'i3 MK3S');

[ ] 4. Run
[ ] 5. Verificar en "Database" → "Tables" → "machines"
```

### Paso 5: Verificar Variables de Entorno

```
[ ] 1. Abrir archivo: .env.local
[ ] 2. Verificar que tenga:
    NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

[ ] 3. Si NO existe el archivo, crearlo con:
    [ ] Ir a Supabase → "Project Settings" → "API"
    [ ] Copiar "Project URL" → pegar en NEXT_PUBLIC_SUPABASE_URL
    [ ] Copiar "anon public" key → pegar en NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## 🚀 INICIAR LA APLICACIÓN

### Paso 6: Iniciar Servidor de Desarrollo

```bash
[ ] 1. Abrir terminal en la carpeta del proyecto
[ ] 2. Ejecutar: pnpm dev
[ ] 3. Esperar mensaje: "Ready in X seconds"
[ ] 4. Abrir navegador: http://localhost:3000
```

### Paso 7: Crear Primera Cuenta

```
[ ] 1. Serás redirigido a /login automáticamente
[ ] 2. Click en "¿No tienes cuenta? Regístrate"
[ ] 3. Completar formulario:
    [ ] Nombre completo: Tu nombre
    [ ] Email: tu@email.com
    [ ] Contraseña: mínimo 6 caracteres
[ ] 4. Click "Crear Cuenta"
[ ] 5. Deberías ver mensaje: "Cuenta creada exitosamente!"
[ ] 6. Click en "¿Ya tienes cuenta? Inicia sesión"
[ ] 7. Ingresar email y contraseña
[ ] 8. Click "Iniciar Sesión"
```

**✅ Resultado esperado**: 
- Entras al dashboard
- Header muestra tu nombre
- Botón "Cerrar Sesión" visible

---

## 🧪 PROBAR FUNCIONALIDADES

### Paso 8: Probar Materiales

```
[ ] 1. Click en "Inventario de materiales" en el sidebar
[ ] 2. Click "Agregar material"
[ ] 3. Completar:
    [ ] Nombre: PLA Blanco
    [ ] Tipo: Filamento
    [ ] Cantidad: 5000
    [ ] Unidad: Gramos (g)
    [ ] Costo unitario: 0.025
    [ ] Fecha de compra: (selecciona fecha)
[ ] 4. Click "Agregar"
[ ] 5. Verificar que aparezca en la tabla
[ ] 6. Click en botón de editar (lápiz)
[ ] 7. Cambiar cantidad a 4500
[ ] 8. Click "Actualizar"
[ ] 9. Verificar cambio en la tabla
```

### Paso 9: Verificar en Supabase

```
[ ] 1. Volver a Supabase Dashboard
[ ] 2. "Database" → "Tables" → "materials"
[ ] 3. Verificar que el material esté ahí
[ ] 4. Los cambios deben coincidir
```

### Paso 10: Probar Productos

```
[ ] 1. Click en "Productos" en el sidebar
[ ] 2. Debería mostrar: "No hay productos registrados"
[ ] 3. Esto es NORMAL
[ ] 4. Los productos se crean desde "Cotizaciones"
```

**NOTA**: Por ahora, Cotizaciones todavía usa localStorage. Se migrará después.

---

## ✅ VERIFICACIÓN FINAL

### En Supabase:

```
[ ] Table "users" tiene 1 registro (tu cuenta)
[ ] Table "materials" tiene los materiales que agregaste
[ ] Table "machines" tiene 3 máquinas (si las insertaste)
[ ] Table "products" está vacía (OK por ahora)
[ ] Authentication → Users muestra tu email
```

### En la Aplicación:

```
[ ] Login funciona
[ ] Logout funciona
[ ] Header muestra tu nombre
[ ] Materiales:
    [ ] Crear funciona
    [ ] Editar funciona
    [ ] Eliminar funciona (marca como inactivo)
    [ ] Los datos persisten al recargar (F5)
[ ] Productos: Vacío pero sin errores
```

---

## 🚨 SI ALGO FALLA

### Error: "Invalid API key"
```
[ ] Verificar .env.local
[ ] Copiar de nuevo las keys desde Supabase
[ ] Reiniciar servidor: Ctrl+C, luego pnpm dev
```

### Error: "relation does not exist"
```
[ ] El SQL no se ejecutó correctamente
[ ] Volver a ejecutar supabase-setup.sql
[ ] Verificar en Database → Tables que las tablas existan
```

### Error: "permission denied"
```
[ ] No estás autenticado
[ ] Logout y volver a login
[ ] Verificar que el trigger handle_new_user() se ejecutó
[ ] Verificar en users table que tu registro exista
```

### No puedo crear cuenta
```
[ ] Verificar que Email Auth esté enabled
[ ] Abrir consola del navegador (F12)
[ ] Ver errores en Console
[ ] Ver Network tab para ver qué falla
```

---

## 📊 ESTADO ACTUAL

```
✅ FUNCIONAL:
- Autenticación (login, register, logout)
- Materiales (CRUD completo)
- Productos (lectura, agregar stock, vender, eliminar)

⏳ PENDIENTE:
- Cotizaciones (todavía usa localStorage)
- Dashboard (datos mockeados)

🎯 PROGRESO TOTAL: 80%
```

---

## 📞 SOPORTE

Si completaste todos los pasos y algo no funciona:

1. ✅ Abre la consola del navegador (F12)
2. ✅ Ve a la pestaña "Console"
3. ✅ Copia cualquier error en rojo
4. ✅ Ve a la pestaña "Network"
5. ✅ Busca requests fallidos (en rojo)
6. ✅ Click en el request → Preview/Response
7. ✅ Copia el mensaje de error
8. ✅ Comparte el error conmigo

---

**¡IMPORTANTE!**: El paso más crítico es ejecutar el SQL en Supabase. Sin eso, NADA funcionará.

**Fecha**: 22 de octubre de 2025  
**Versión**: 1.0
