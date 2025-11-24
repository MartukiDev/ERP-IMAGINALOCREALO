-- ============================================
-- FIX: TRIGGER DE STATUS PARA MATERIALES
-- ============================================
-- Problema: El trigger no considera la unidad (kg vs g)
-- Solución: Convertir todo a gramos antes de comparar

-- 1. Eliminar el trigger y función actuales
DROP TRIGGER IF EXISTS material_status_trigger ON materials;
DROP FUNCTION IF EXISTS update_material_status();

-- 2. Crear nueva función que considera las unidades
CREATE OR REPLACE FUNCTION update_material_status()
RETURNS TRIGGER AS $$
DECLARE
  quantity_in_grams NUMERIC;
BEGIN
  -- Convertir la cantidad a gramos según la unidad
  IF NEW.unit = 'kg' THEN
    quantity_in_grams := NEW.quantity * 1000;
  ELSIF NEW.unit = 'g' THEN
    quantity_in_grams := NEW.quantity;
  ELSIF NEW.unit = 'ml' THEN
    -- Para líquidos (resina), 1ml ≈ 1g
    quantity_in_grams := NEW.quantity;
  ELSIF NEW.unit = 'L' THEN
    -- Para líquidos en litros
    quantity_in_grams := NEW.quantity * 1000;
  ELSE
    -- Si no hay unidad o es desconocida, usar el valor tal cual
    quantity_in_grams := NEW.quantity;
  END IF;

  -- Actualizar el status basado en gramos
  IF quantity_in_grams = 0 THEN
    NEW.status := 'out';
  ELSIF quantity_in_grams < 1000 THEN
    NEW.status := 'low';
  ELSE
    NEW.status := 'active';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Recrear el trigger
CREATE TRIGGER material_status_trigger
  BEFORE INSERT OR UPDATE OF quantity, unit ON materials
  FOR EACH ROW
  EXECUTE FUNCTION update_material_status();

-- 4. Actualizar el status de todos los materiales existentes
-- (forzar recalculo del status con los datos actuales)
UPDATE materials 
SET quantity = quantity
WHERE id IS NOT NULL;

-- 5. Verificar resultados
SELECT 
  name,
  quantity,
  unit,
  CASE 
    WHEN unit = 'kg' THEN quantity * 1000
    WHEN unit = 'g' THEN quantity
    WHEN unit = 'ml' THEN quantity
    WHEN unit = 'L' THEN quantity * 1000
    ELSE quantity
  END as quantity_in_grams,
  status
FROM materials
ORDER BY status, name;

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Copia todo este archivo
-- 2. Ve a Supabase Dashboard > SQL Editor
-- 3. Pega y ejecuta
-- 4. Verifica que el material "Creality 1 kg" ahora tenga status = 'active'
-- 5. El resultado final mostrará todos los materiales con su conversión a gramos
-- ============================================

-- UMBRALES ACTUALES:
-- - Agotado (out): 0 gramos
-- - Bajo stock (low): < 1000 gramos (< 1 kg)
-- - Activo (active): >= 1000 gramos (>= 1 kg)
-- ============================================
