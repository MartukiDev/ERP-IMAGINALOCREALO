-- ============================================
-- FIX: Configurar RLS para que cada usuario vea solo SUS datos
-- ============================================
-- Este script actualiza las políticas RLS para filtrar por usuario

-- ====================
-- PRODUCTOS
-- ====================
-- Eliminar políticas antiguas
DROP POLICY IF EXISTS "Users can view all products" ON products;
DROP POLICY IF EXISTS "Users can view own products" ON products;
DROP POLICY IF EXISTS "Users can insert products" ON products;
DROP POLICY IF EXISTS "Users can insert own products" ON products;
DROP POLICY IF EXISTS "Users can update products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;
DROP POLICY IF EXISTS "Users can delete products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;

-- Nuevas políticas: solo ver productos creados por el usuario
CREATE POLICY "Users can view own products" ON products
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert own products" ON products
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own products" ON products
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own products" ON products
  FOR DELETE USING (created_by = auth.uid());

-- ====================
-- MATERIALES
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
-- VENTAS
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
-- COTIZACIONES
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
-- MOVIMIENTOS DE STOCK
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
-- MOVIMIENTOS DE MATERIALES
-- ====================
DROP POLICY IF EXISTS "Users can view all material movements" ON material_movements;
DROP POLICY IF EXISTS "Users can view own material movements" ON material_movements;
DROP POLICY IF EXISTS "Users can insert material movements" ON material_movements;
DROP POLICY IF EXISTS "Users can insert own material movements" ON material_movements;
DROP POLICY IF EXISTS "Users can update material movements" ON material_movements;
DROP POLICY IF EXISTS "Users can update own material movements" ON material_movements;
DROP POLICY IF EXISTS "Users can delete material movements" ON material_movements;
DROP POLICY IF EXISTS "Users can delete own material movements" ON material_movements;

CREATE POLICY "Users can view own material movements" ON material_movements
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert own material movements" ON material_movements
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own material movements" ON material_movements
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own material movements" ON material_movements
  FOR DELETE USING (created_by = auth.uid());

-- ====================
-- TRANSACCIONES
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
-- MÁQUINAS (compartidas entre todos los usuarios)
-- ====================
-- Las máquinas se mantienen visibles para todos
DROP POLICY IF EXISTS "Users can view all machines" ON machines;
DROP POLICY IF EXISTS "Users can insert machines" ON machines;
DROP POLICY IF EXISTS "Users can update machines" ON machines;
DROP POLICY IF EXISTS "Users can delete machines" ON machines;

CREATE POLICY "Users can view all machines" ON machines
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert machines" ON machines
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update machines" ON machines
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete machines" ON machines
  FOR DELETE USING (auth.role() = 'authenticated');

-- ====================
-- VERIFICACIÓN
-- ====================
SELECT 
  schemaname, 
  tablename, 
  policyname,
  CASE 
    WHEN policyname LIKE '%own%' THEN '🔒 Solo tus datos'
    WHEN policyname LIKE '%all%' THEN '🌐 Compartido'
    ELSE '❓ Otro'
  END as tipo_acceso
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN (
    'products', 'materials', 'sales', 'quotations', 
    'stock_movements', 'material_movements', 'transactions', 'machines'
  )
ORDER BY tablename, policyname;
