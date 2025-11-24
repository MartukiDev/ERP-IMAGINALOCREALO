-- ============================================
-- FIX: Crear registro en tabla users para usuario autenticado
-- ============================================
-- Este script soluciona el error de foreign key en created_by

-- PASO 1: Ver todos los usuarios en auth.users (tabla de Supabase Auth)
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- PASO 2: Ver qué usuarios existen en la tabla users (nuestra tabla)
SELECT 
  id, 
  email, 
  full_name,
  role,
  created_at
FROM users 
ORDER BY created_at DESC;

-- PASO 3: REEMPLAZA 'TU_USER_ID_AQUI' con el ID que viste en PASO 1
-- Copia el ID completo (UUID) del usuario que eres tú en auth.users
-- Ejemplo: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

DO $$
DECLARE
  v_user_id UUID := 'TU_USER_ID_AQUI'; -- ⚠️ REEMPLAZAR ESTE VALOR
  v_email TEXT;
BEGIN
  -- Obtener email del usuario de auth.users
  SELECT email INTO v_email
  FROM auth.users
  WHERE id = v_user_id;
  
  -- Crear el usuario en la tabla users si no existe
  INSERT INTO users (id, email, full_name, role)
  VALUES (
    v_user_id,
    v_email,
    'Administrador', -- Cambiar por tu nombre si quieres
    'admin'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Actualizar movimientos sin created_by
  UPDATE stock_movements 
  SET created_by = v_user_id 
  WHERE created_by IS NULL;
  
  UPDATE material_movements 
  SET created_by = v_user_id 
  WHERE created_by IS NULL;
  
  UPDATE sales 
  SET created_by = v_user_id 
  WHERE created_by IS NULL;
  
  UPDATE materials 
  SET created_by = v_user_id 
  WHERE created_by IS NULL;
  
  RAISE NOTICE 'Usuario creado/actualizado correctamente: % (%)', v_email, v_user_id;
END $$;

-- Verificación final
SELECT 
  'stock_movements' as tabla,
  COUNT(*) as total,
  COUNT(created_by) as con_usuario
FROM stock_movements
UNION ALL
SELECT 
  'sales' as tabla,
  COUNT(*) as total,
  COUNT(created_by) as con_usuario
FROM sales
UNION ALL
SELECT 
  'materials' as tabla,
  COUNT(*) as total,
  COUNT(created_by) as con_usuario
FROM materials;
