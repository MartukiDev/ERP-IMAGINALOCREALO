-- ============================================
-- FIX: Agregar políticas INSERT/UPDATE/DELETE para stock_movements y material_movements
-- ============================================
-- Ejecutar este script en Supabase SQL Editor

-- Políticas para stock_movements
DROP POLICY IF EXISTS "Users can insert stock movements" ON stock_movements;
CREATE POLICY "Users can insert stock movements" ON stock_movements
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update stock movements" ON stock_movements;
CREATE POLICY "Users can update stock movements" ON stock_movements
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete stock movements" ON stock_movements;
CREATE POLICY "Users can delete stock movements" ON stock_movements
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para material_movements
DROP POLICY IF EXISTS "Users can insert material movements" ON material_movements;
CREATE POLICY "Users can insert material movements" ON material_movements
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update material movements" ON material_movements;
CREATE POLICY "Users can update material movements" ON material_movements
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete material movements" ON material_movements;
CREATE POLICY "Users can delete material movements" ON material_movements
  FOR DELETE USING (auth.role() = 'authenticated');

-- Verificar que se crearon correctamente
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN '✅ SELECT'
    WHEN cmd = 'INSERT' THEN '✅ INSERT'
    WHEN cmd = 'UPDATE' THEN '✅ UPDATE'
    WHEN cmd = 'DELETE' THEN '✅ DELETE'
    ELSE cmd
  END as operation
FROM pg_policies 
WHERE tablename IN ('stock_movements', 'material_movements')
ORDER BY tablename, cmd;
