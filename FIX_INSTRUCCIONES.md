# 🔧 SOLUCIÓN RÁPIDA: Error RLS en Registro

## ❌ Error que tenías:
```
new row violates row-level security policy for table "users"
```

## ✅ Causa:
Faltaban dos cosas en el SQL:
1. **Política INSERT** para permitir crear usuarios durante el registro
2. **Trigger** que crea el usuario en la tabla `users` cuando se registra en Auth

## 🚀 SOLUCIÓN (Elige una opción):

### Opción 1: Ejecutar Solo el FIX (Más Rápido)

Si ya ejecutaste el `supabase-setup.sql` anteriormente:

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Copia y pega TODO el contenido de: **`FIX_RLS_USERS.sql`**
3. Click en **Run**
4. ✅ Listo, ya puedes registrarte

### Opción 2: Re-ejecutar el SQL Completo (Recomendado)

Si prefieres empezar desde cero:

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. **PRIMERO**, elimina las tablas existentes (si las hay):

```sql
-- Copia y ejecuta esto primero
DROP TABLE IF EXISTS material_movements CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS quotations CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS machines CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
```

3. **DESPUÉS**, ejecuta TODO el contenido de: **`supabase-setup.sql`**
4. ✅ Listo

---

## 🧪 Probar que Funciona

1. Ve a `http://localhost:3000/login`
2. Click en "¿No tienes cuenta? Regístrate"
3. Completa:
   - Nombre: Tu nombre
   - Email: tu@email.com
   - Contraseña: 123456 (o cualquier contraseña de 6+ caracteres)
4. Click "Crear Cuenta"
5. ✅ Deberías ver: "Cuenta creada exitosamente!"
6. Inicia sesión con ese email y contraseña
7. ✅ Deberías entrar al dashboard

---

## 🔍 Verificar en Supabase

Después de registrarte, verifica:

1. **Authentication** → **Users**: Debe aparecer tu email
2. **Database** → **Tables** → **users**: Debe haber 1 fila con:
   - `id`: (UUID)
   - `email`: tu@email.com
   - `full_name`: Tu nombre
   - `role`: admin
   - `is_active`: true

---

## ❓ Si Sigue Sin Funcionar

### Error: "duplicate key value violates unique constraint"
- Ya tienes un usuario con ese email
- Usa otro email o elimina el usuario existente:

```sql
-- En SQL Editor de Supabase
DELETE FROM auth.users WHERE email = 'tu@email.com';
DELETE FROM users WHERE email = 'tu@email.com';
```

### Error: "trigger function does not exist"
- El trigger no se creó
- Ejecuta solo esta parte del SQL:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'admin'
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Error: Otro error diferente
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Copia el error completo
4. Compártelo conmigo

---

## 📝 Qué se Corrigió

### En `supabase-setup.sql`:
```sql
-- ANTES (MALO):
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- DESPUÉS (BUENO):
CREATE POLICY "Enable insert during registration" ON users
  FOR INSERT WITH CHECK (true);  -- ← ESTO FALTABA

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
```

### Además se agregó:
```sql
-- Función que crea usuario en tabla users
CREATE FUNCTION handle_new_user() ...

-- Trigger que ejecuta la función
CREATE TRIGGER on_auth_user_created ...
```

---

## ✅ Resultado Esperado

Después de aplicar el fix:
- ✅ Puedes crear cuenta sin errores
- ✅ El trigger crea automáticamente el registro en `users`
- ✅ El usuario se crea con rol `admin` por defecto
- ✅ Puedes iniciar sesión
- ✅ El header muestra tu nombre
- ✅ Todo funciona correctamente

---

**Resumen**: Ejecuta `FIX_RLS_USERS.sql` y ya podrás registrarte sin problemas.

**Fecha**: 22 de octubre de 2025
