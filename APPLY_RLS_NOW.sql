-- ============================================
-- APLICAR RLS INMEDIATAMENTE - Cada usuario ve solo SUS datos
-- ============================================
-- Ejecuta este script completo en Supabase SQL Editor

-- Verificar estado actual de RLS
SELECT 
  tablename,
  rowsecurity as "RLS Activado"
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('products', 'materials', 'sales', 'quotations', 'transactions')
ORDER BY tablename;

-- ====================
-- 1. PRODUCTOS
-- ====================
-- Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "Users can view all products" ON products;
DROP POLICY IF EXISTS "Users can view own products" ON products;
DROP POLICY IF EXISTS "Users can insert products" ON products;
DROP POLICY IF EXISTS "Users can insert own products" ON products;
DROP POLICY IF EXISTS "Users can update products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;
DROP POLICY IF EXISTS "Users can delete products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;

-- Crear políticas restrictivas (solo tus productos)
CREATE POLICY "Users can view own products" ON products
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert own products" ON products
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own products" ON products
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own products" ON products
  FOR DELETE USING (created_by = auth.uid());

-- ====================
-- 2. MATERIALES
-- ====================
DROP POLICY IF EXISTS "Users can view all materials" ON materials;
DROP POLICY IF EXISTS "Users can view own materials" ON materials;
DROP POLICY IF EXISTS "Users can insert materials" ON materials;
DROP POLICY IF EXISTS "Users can insert own materials" ON materials;
DROP POLICY IF EXISTS "Users can update materials" ON materials;
DROP POLICY IF EXISTS "Users can update own materials" ON materials;
DROP POLICY IF EXISTS "Users can delete materials" ON materials;
DROP POLICY IF EXISTS "Users can delete own materials" ON materials;

CREATE POLICY "Users can view own materials" ON materials
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert own materials" ON materials
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own materials" ON materials
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own materials" ON materials
  FOR DELETE USING (created_by = auth.uid());

-- ====================
-- 3. VENTAS
-- ====================
DROP POLICY IF EXISTS "Users can view all sales" ON sales;
DROP POLICY IF EXISTS "Users can view own sales" ON sales;
DROP POLICY IF EXISTS "Users can insert sales" ON sales;
DROP POLICY IF EXISTS "Users can insert own sales" ON sales;
DROP POLICY IF EXISTS "Users can update sales" ON sales;
DROP POLICY IF EXISTS "Users can update own sales" ON sales;
DROP POLICY IF EXISTS "Users can delete sales" ON sales;
DROP POLICY IF EXISTS "Users can delete own sales" ON sales;

CREATE POLICY "Users can view own sales" ON sales
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert own sales" ON sales
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own sales" ON sales
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own sales" ON sales
  FOR DELETE USING (created_by = auth.uid());

-- ====================
-- 4. COTIZACIONES
-- ====================
DROP POLICY IF EXISTS "Users can view all quotations" ON quotations;
DROP POLICY IF EXISTS "Users can view own quotations" ON quotations;
DROP POLICY IF EXISTS "Users can insert quotations" ON quotations;
DROP POLICY IF EXISTS "Users can insert own quotations" ON quotations;
DROP POLICY IF EXISTS "Users can update quotations" ON quotations;
DROP POLICY IF EXISTS "Users can update own quotations" ON quotations;
DROP POLICY IF EXISTS "Users can delete quotations" ON quotations;
DROP POLICY IF EXISTS "Users can delete own quotations" ON quotations;

CREATE POLICY "Users can view own quotations" ON quotations
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert own quotations" ON quotations
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own quotations" ON quotations
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own quotations" ON quotations
  FOR DELETE USING (created_by = auth.uid());

-- ====================
-- 5. TRANSACCIONES
-- ====================
DROP POLICY IF EXISTS "Users can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (created_by = auth.uid());

-- ====================
-- 6. MOVIMIENTOS
-- ====================
DROP POLICY IF EXISTS "Users can view all stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Users can view own stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Users can insert stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Users can insert own stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Users can update stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Users can update own stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Users can delete stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Users can delete own stock movements" ON stock_movements;

CREATE POLICY "Users can view own stock movements" ON stock_movements
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert own stock movements" ON stock_movements
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own stock movements" ON stock_movements
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own stock movements" ON stock_movements
  FOR DELETE USING (created_by = auth.uid());

-- ====================
-- VERIFICACIÓN FINAL
-- ====================
-- Ver todas las políticas aplicadas
SELECT 
  tablename,
  policyname,
  cmd as operacion,
  CASE 
    WHEN policyname LIKE '%own%' THEN '🔒 Solo tus datos'
    WHEN policyname LIKE '%all%' THEN '🌐 Compartido'
    ELSE '❓ Verificar'
  END as tipo
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('products', 'materials', 'sales', 'quotations', 'transactions', 'stock_movements')
ORDER BY tablename, cmd;

-- Verificar que RLS esté activado
SELECT 
  'RLS Status' as descripcion,
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ ACTIVADO'
    ELSE '❌ DESACTIVADO - URGENTE ACTIVAR'
  END as estado
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('products', 'materials', 'sales', 'quotations', 'transactions', 'stock_movements')
ORDER BY tablename;
