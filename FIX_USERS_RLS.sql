-- ============================================
-- FIX: POLÍTICA RLS PARA TABLA USERS
-- ============================================
-- Problema: La política actual bloquea incluso al propio usuario
-- Solución: Reemplazar con política que funcione correctamente

-- 1. Eliminar política existente
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- 2. Crear nueva política más permisiva para SELECT
-- Esta permite que los usuarios vean su propio perfil correctamente
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- 3. Verificar que las políticas de INSERT y UPDATE estén correctas
-- Estas deberían permitir:
-- - INSERT durante registro
-- - UPDATE solo del propio perfil

-- Si no existen, crearlas:
DROP POLICY IF EXISTS "Enable insert during registration" ON users;
CREATE POLICY "users_insert_own" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 4. Habilitar RLS en la tabla (si no está habilitado)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 5. Verificar políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users';

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Copia todo este archivo
-- 2. Ve a Supabase Dashboard > SQL Editor
-- 3. Pega y ejecuta
-- 4. Verifica que aparezcan 3 políticas para la tabla users:
--    - users_select_own (SELECT)
--    - users_insert_own (INSERT)
--    - users_update_own (UPDATE)
-- ============================================
